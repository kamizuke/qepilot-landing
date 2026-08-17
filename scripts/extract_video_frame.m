#import <AVFoundation/AVFoundation.h>
#import <Foundation/Foundation.h>
#import <ImageIO/ImageIO.h>
#import <UniformTypeIdentifiers/UniformTypeIdentifiers.h>

int main(int argc, const char *argv[]) {
    @autoreleasepool {
        if (argc != 4) {
            fprintf(stderr, "Uso: extract_video_frame input.mp4 seconds output.png\n");
            return 1;
        }
        NSString *inputPath = [NSString stringWithUTF8String:argv[1]];
        double seconds = atof(argv[2]);
        NSString *outputPath = [NSString stringWithUTF8String:argv[3]];

        AVURLAsset *asset = [AVURLAsset URLAssetWithURL:[NSURL fileURLWithPath:inputPath] options:nil];
        AVAssetImageGenerator *generator = [AVAssetImageGenerator assetImageGeneratorWithAsset:asset];
        generator.appliesPreferredTrackTransform = YES;
        generator.requestedTimeToleranceBefore = CMTimeMakeWithSeconds(0.05, 600);
        generator.requestedTimeToleranceAfter = CMTimeMakeWithSeconds(0.05, 600);
        NSError *error = nil;
        CGImageRef image = [generator copyCGImageAtTime:CMTimeMakeWithSeconds(seconds, 600)
                                            actualTime:NULL
                                                 error:&error];
        if (!image) {
            NSLog(@"No se pudo extraer el fotograma: %@", error);
            return 2;
        }
        NSURL *outputURL = [NSURL fileURLWithPath:outputPath];
        CGImageDestinationRef destination = CGImageDestinationCreateWithURL(
            (__bridge CFURLRef)outputURL, (__bridge CFStringRef)UTTypePNG.identifier, 1, NULL);
        if (!destination) {
            CGImageRelease(image);
            return 3;
        }
        CGImageDestinationAddImage(destination, image, NULL);
        BOOL ok = CGImageDestinationFinalize(destination);
        CFRelease(destination);
        CGImageRelease(image);
        return ok ? 0 : 4;
    }
}
