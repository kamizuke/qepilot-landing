#import <AVFoundation/AVFoundation.h>
#import <Foundation/Foundation.h>

// Recomprime un vídeo a un ancho y bitrate concretos para publicarlo en la web.
// Uso: compress_video_web input.mp4 output.mp4 ancho bitrate_kbps
int main(int argc, const char *argv[]) {
    @autoreleasepool {
        if (argc != 5) {
            fprintf(stderr, "Uso: compress_video_web input.mp4 output.mp4 ancho bitrate_kbps\n");
            return 1;
        }
        NSURL *inputURL = [NSURL fileURLWithPath:[NSString stringWithUTF8String:argv[1]]];
        NSURL *outputURL = [NSURL fileURLWithPath:[NSString stringWithUTF8String:argv[2]]];
        int targetWidth = atoi(argv[3]);
        int bitrateKbps = atoi(argv[4]);

        [[NSFileManager defaultManager] removeItemAtURL:outputURL error:nil];

        AVURLAsset *asset = [AVURLAsset URLAssetWithURL:inputURL options:nil];
        AVAssetTrack *source = [[asset tracksWithMediaType:AVMediaTypeVideo] firstObject];
        if (!source) { fprintf(stderr, "No hay pista de vídeo.\n"); return 2; }

        CGSize natural = source.naturalSize;
        int targetHeight = (int)lround(natural.height * (targetWidth / natural.width));
        if (targetHeight % 2 != 0) targetHeight += 1;

        NSError *error = nil;
        AVAssetReader *reader = [AVAssetReader assetReaderWithAsset:asset error:&error];
        if (!reader) { NSLog(@"Reader: %@", error); return 3; }
        AVAssetReaderTrackOutput *output = [AVAssetReaderTrackOutput
            assetReaderTrackOutputWithTrack:source
                             outputSettings:@{(id)kCVPixelBufferPixelFormatTypeKey:
                                                  @(kCVPixelFormatType_32BGRA)}];
        [reader addOutput:output];

        AVAssetWriter *writer = [AVAssetWriter assetWriterWithURL:outputURL
                                                         fileType:AVFileTypeMPEG4
                                                            error:&error];
        if (!writer) { NSLog(@"Writer: %@", error); return 4; }
        NSDictionary *videoSettings = @{
            AVVideoCodecKey: AVVideoCodecTypeH264,
            AVVideoWidthKey: @(targetWidth),
            AVVideoHeightKey: @(targetHeight),
            AVVideoCompressionPropertiesKey: @{
                AVVideoAverageBitRateKey: @(bitrateKbps * 1000),
                AVVideoMaxKeyFrameIntervalKey: @(60),
                AVVideoProfileLevelKey: AVVideoProfileLevelH264HighAutoLevel,
                AVVideoAllowFrameReorderingKey: @YES
            }
        };
        AVAssetWriterInput *input = [AVAssetWriterInput assetWriterInputWithMediaType:AVMediaTypeVideo
                                                                      outputSettings:videoSettings];
        input.expectsMediaDataInRealTime = NO;
        input.transform = source.preferredTransform;
        AVAssetWriterInputPixelBufferAdaptor *adaptor = [AVAssetWriterInputPixelBufferAdaptor
            assetWriterInputPixelBufferAdaptorWithAssetWriterInput:input
                                       sourcePixelBufferAttributes:nil];
        [writer addInput:input];
        // Metadatos web: arranque rápido para reproducción progresiva.
        writer.shouldOptimizeForNetworkUse = YES;

        [writer startWriting];
        [writer startSessionAtSourceTime:kCMTimeZero];
        [reader startReading];

        dispatch_semaphore_t done = dispatch_semaphore_create(0);
        dispatch_queue_t queue = dispatch_queue_create("compress", DISPATCH_QUEUE_SERIAL);
        [input requestMediaDataWhenReadyOnQueue:queue usingBlock:^{
            while (input.isReadyForMoreMediaData) {
                CMSampleBufferRef sample = [output copyNextSampleBuffer];
                if (!sample) {
                    [input markAsFinished];
                    [writer finishWritingWithCompletionHandler:^{ dispatch_semaphore_signal(done); }];
                    return;
                }
                CVPixelBufferRef pixels = CMSampleBufferGetImageBuffer(sample);
                CMTime time = CMSampleBufferGetPresentationTimeStamp(sample);
                if (pixels) [adaptor appendPixelBuffer:pixels withPresentationTime:time];
                CFRelease(sample);
            }
        }];
        dispatch_semaphore_wait(done, DISPATCH_TIME_FOREVER);

        if (writer.status != AVAssetWriterStatusCompleted) {
            NSLog(@"Error al escribir: %@", writer.error);
            return 5;
        }
        (void)adaptor;
        return 0;
    }
}
