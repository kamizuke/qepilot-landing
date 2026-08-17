#import <AVFoundation/AVFoundation.h>
#import <Foundation/Foundation.h>

int main(int argc, const char *argv[]) {
    @autoreleasepool {
        if (argc != 3) {
            fprintf(stderr, "Uso: strip_video_audio input.mp4 output.mp4\n");
            return 1;
        }
        NSString *inputPath = [NSString stringWithUTF8String:argv[1]];
        NSString *outputPath = [NSString stringWithUTF8String:argv[2]];
        NSURL *inputURL = [NSURL fileURLWithPath:inputPath];
        NSURL *outputURL = [NSURL fileURLWithPath:outputPath];
        [[NSFileManager defaultManager] removeItemAtURL:outputURL error:nil];

        AVURLAsset *asset = [AVURLAsset URLAssetWithURL:inputURL options:nil];
        AVAssetTrack *sourceTrack = [[asset tracksWithMediaType:AVMediaTypeVideo] firstObject];
        if (!sourceTrack) return 2;

        AVMutableComposition *composition = [AVMutableComposition composition];
        AVMutableCompositionTrack *videoTrack = [composition addMutableTrackWithMediaType:AVMediaTypeVideo
                                                                         preferredTrackID:kCMPersistentTrackID_Invalid];
        NSError *error = nil;
        CMTimeRange range = CMTimeRangeMake(kCMTimeZero, asset.duration);
        if (![videoTrack insertTimeRange:range ofTrack:sourceTrack atTime:kCMTimeZero error:&error]) {
            NSLog(@"No se pudo copiar el vídeo: %@", error);
            return 3;
        }
        videoTrack.preferredTransform = sourceTrack.preferredTransform;

        AVAssetExportSession *exporter = [[AVAssetExportSession alloc]
            initWithAsset:composition presetName:AVAssetExportPresetPassthrough];
        exporter.outputURL = outputURL;
        exporter.outputFileType = AVFileTypeMPEG4;
        dispatch_semaphore_t semaphore = dispatch_semaphore_create(0);
        [exporter exportAsynchronouslyWithCompletionHandler:^{ dispatch_semaphore_signal(semaphore); }];
        dispatch_semaphore_wait(semaphore, DISPATCH_TIME_FOREVER);
        if (exporter.status != AVAssetExportSessionStatusCompleted) {
            NSLog(@"No se pudo exportar: %@", exporter.error);
            return 4;
        }
        printf("%s\n", outputPath.UTF8String);
    }
    return 0;
}
