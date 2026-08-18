#import <AVFoundation/AVFoundation.h>
#import <Foundation/Foundation.h>

typedef struct {
    double start;
    double end;
} ClipRange;

int main(int argc, const char *argv[]) {
    @autoreleasepool {
        if (argc != 3) {
            fprintf(stderr, "Uso: create_landing_cut input.mp4 output.mp4\n");
            return 1;
        }
        NSString *inputPath = [NSString stringWithUTF8String:argv[1]];
        NSString *outputPath = [NSString stringWithUTF8String:argv[2]];
        NSURL *inputURL = [NSURL fileURLWithPath:inputPath];
        NSURL *outputURL = [NSURL fileURLWithPath:outputPath];

        // Story cut: problem → Word friction → transition → Evidran proof → payoff.
        ClipRange ranges[] = {
            {2.0, 14.0},
            {15.0, 19.0},
            {24.0, 28.0},
            {48.0, 51.25},
            {52.0, 64.0},
            {64.0, 68.0},
            {76.0, 81.0},
            {88.0, 94.0},
            {112.0, 116.0},
            {127.0, 132.0},
            {148.0, 152.2}
        };
        NSUInteger rangeCount = sizeof(ranges) / sizeof(ranges[0]);

        AVURLAsset *asset = [AVURLAsset URLAssetWithURL:inputURL options:nil];
        AVAssetTrack *sourceVideo = [[asset tracksWithMediaType:AVMediaTypeVideo] firstObject];
        if (!sourceVideo) {
            fprintf(stderr, "No se encontró una pista de vídeo.\n");
            return 2;
        }

        AVMutableComposition *composition = [AVMutableComposition composition];
        AVMutableCompositionTrack *videoTrack = [composition addMutableTrackWithMediaType:AVMediaTypeVideo
                                                                         preferredTrackID:kCMPersistentTrackID_Invalid];
        videoTrack.preferredTransform = sourceVideo.preferredTransform;
        CMTime cursor = kCMTimeZero;
        NSError *error = nil;

        for (NSUInteger index = 0; index < rangeCount; index++) {
            CMTime start = CMTimeMakeWithSeconds(ranges[index].start, 600);
            CMTime duration = CMTimeMakeWithSeconds(ranges[index].end - ranges[index].start, 600);
            CMTimeRange range = CMTimeRangeMake(start, duration);
            if (![videoTrack insertTimeRange:range ofTrack:sourceVideo atTime:cursor error:&error]) {
                NSLog(@"Error insertando el fragmento %lu: %@", (unsigned long)index, error);
                return 3;
            }
            cursor = CMTimeAdd(cursor, duration);
        }

        [[NSFileManager defaultManager] removeItemAtURL:outputURL error:nil];
        AVAssetExportSession *exporter = [[AVAssetExportSession alloc]
            initWithAsset:composition presetName:AVAssetExportPreset1920x1080];
        if (!exporter) return 4;
        exporter.outputURL = outputURL;
        exporter.outputFileType = AVFileTypeMPEG4;
        exporter.shouldOptimizeForNetworkUse = YES;
        exporter.timeRange = CMTimeRangeMake(kCMTimeZero, cursor);

        dispatch_semaphore_t semaphore = dispatch_semaphore_create(0);
        [exporter exportAsynchronouslyWithCompletionHandler:^{ dispatch_semaphore_signal(semaphore); }];
        dispatch_semaphore_wait(semaphore, DISPATCH_TIME_FOREVER);
        if (exporter.status != AVAssetExportSessionStatusCompleted) {
            NSLog(@"Error de exportación: %@", exporter.error);
            return 5;
        }
        printf("%s\n", outputPath.UTF8String);
    }
    return 0;
}
