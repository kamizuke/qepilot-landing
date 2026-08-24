#import <AVFoundation/AVFoundation.h>
#import <CoreGraphics/CoreGraphics.h>
#import <CoreText/CoreText.h>
#import <Foundation/Foundation.h>
#import <ImageIO/ImageIO.h>
#import <QuartzCore/QuartzCore.h>
#include <math.h>

static const CGFloat kWidth = 1920.0;
static const CGFloat kHeight = 1080.0;

static CGColorRef CreateRGB(CGFloat red, CGFloat green, CGFloat blue, CGFloat alpha) {
    CGColorSpaceRef space = CGColorSpaceCreateDeviceRGB();
    CGFloat components[] = {red, green, blue, alpha};
    CGColorRef color = CGColorCreate(space, components);
    CGColorSpaceRelease(space);
    return color;
}

static void DrawCenteredLine(CGContextRef context, NSString *text, CGFloat size,
                             CGColorRef color, CGFloat baseline, CFStringRef fontName) {
    CTFontRef font = CTFontCreateWithName(fontName, size, NULL);
    NSDictionary *attributes = @{
        (__bridge NSString *)kCTFontAttributeName: (__bridge id)font,
        (__bridge NSString *)kCTForegroundColorAttributeName: (__bridge id)color
    };
    NSAttributedString *attributed = [[NSAttributedString alloc] initWithString:text attributes:attributes];
    CTLineRef line = CTLineCreateWithAttributedString((__bridge CFAttributedStringRef)attributed);
    CGFloat width = (CGFloat)CTLineGetTypographicBounds(line, NULL, NULL, NULL);
    CGContextSetTextMatrix(context, CGAffineTransformIdentity);
    CGContextSetTextPosition(context, (kWidth - width) / 2.0, baseline);
    CTLineDraw(line, context);
    CFRelease(line);
    CFRelease(font);
}

static CGImageRef CreateIntroGraphic(CGImageRef logoImage) {
    CGColorSpaceRef space = CGColorSpaceCreateDeviceRGB();
    CGContextRef context = CGBitmapContextCreate(NULL, (size_t)kWidth, (size_t)kHeight, 8, 0,
                                                  space, kCGImageAlphaPremultipliedLast);
    CGColorRef cream = CreateRGB(247.0 / 255.0, 246.0 / 255.0, 242.0 / 255.0, 1.0);
    CGColorRef navy = CreateRGB(2.0 / 255.0, 26.0 / 255.0, 73.0 / 255.0, 1.0);
    CGColorRef blue = CreateRGB(18.0 / 255.0, 119.0 / 255.0, 235.0 / 255.0, 1.0);
    CGContextSetFillColorWithColor(context, cream);
    CGContextFillRect(context, CGRectMake(0, 0, kWidth, kHeight));
    CGContextDrawImage(context, CGRectMake(730, 770, 460, 116), logoImage);
    DrawCenteredLine(context, @"Cómo documentar una no conformidad", 67, navy, 535,
                     CFSTR("HelveticaNeue-Bold"));
    DrawCenteredLine(context, @"Word vs Evidran", 38, blue, 450,
                     CFSTR("HelveticaNeue-Medium"));
    CGContextSetFillColorWithColor(context, blue);
    CGContextFillRect(context, CGRectMake(890, 382, 140, 5));
    CGImageRef image = CGBitmapContextCreateImage(context);
    CGColorRelease(cream);
    CGColorRelease(navy);
    CGColorRelease(blue);
    CGContextRelease(context);
    CGColorSpaceRelease(space);
    return image;
}

static CGImageRef CreateOutroGraphic(void) {
    CGColorSpaceRef space = CGColorSpaceCreateDeviceRGB();
    CGContextRef context = CGBitmapContextCreate(NULL, (size_t)kWidth, (size_t)kHeight, 8, 0,
                                                  space, kCGImageAlphaPremultipliedLast);
    CGContextClearRect(context, CGRectMake(0, 0, kWidth, kHeight));
    CGColorRef navy = CreateRGB(2.0 / 255.0, 26.0 / 255.0, 73.0 / 255.0, 1.0);
    CGColorRef blue = CreateRGB(18.0 / 255.0, 119.0 / 255.0, 235.0 / 255.0, 1.0);
    DrawCenteredLine(context, @"De documento aislado a proceso trazable.", 46, navy, 220,
                     CFSTR("HelveticaNeue-Bold"));
    DrawCenteredLine(context, @"Descubre Evidran", 29, blue, 158,
                     CFSTR("HelveticaNeue-Medium"));
    CGImageRef image = CGBitmapContextCreateImage(context);
    CGColorRelease(navy);
    CGColorRelease(blue);
    CGContextRelease(context);
    CGColorSpaceRelease(space);
    return image;
}

static CAKeyframeAnimation *OpacityAnimation(CFTimeInterval begin, CFTimeInterval duration,
                                             NSArray<NSNumber *> *values,
                                             NSArray<NSNumber *> *keyTimes) {
    CAKeyframeAnimation *animation = [CAKeyframeAnimation animationWithKeyPath:@"opacity"];
    animation.beginTime = AVCoreAnimationBeginTimeAtZero + begin;
    animation.duration = duration;
    animation.values = values;
    animation.keyTimes = keyTimes;
    animation.calculationMode = kCAAnimationLinear;
    animation.fillMode = kCAFillModeBoth;
    animation.removedOnCompletion = NO;
    return animation;
}

static CALayer *IntroLayer(CGImageRef graphic) {
    CALayer *card = [CALayer layer];
    card.frame = CGRectMake(0, 0, kWidth, kHeight);
    card.contents = (__bridge id)graphic;
    card.opacity = 0.0;
    [card addAnimation:OpacityAnimation(0.0, 2.05,
                                        @[@1.0, @1.0, @0.0, @0.0],
                                        @[@0.0, @0.96, @0.99, @1.0])
                  forKey:@"introOpacity"];
    return card;
}

static CALayer *TransitionRepairLayer(void) {
    CGColorRef cream = CreateRGB(247.0 / 255.0, 246.0 / 255.0, 242.0 / 255.0, 1.0);
    CALayer *cover = [CALayer layer];
    cover.frame = CGRectMake(0, 0, kWidth, kHeight);
    cover.backgroundColor = cream;
    cover.opacity = 0.0;
    [cover addAnimation:OpacityAnimation(50.95, 1.30,
                                         @[@0.0, @1.0, @1.0, @0.0],
                                         @[@0.0, @0.15, @0.70, @1.0])
                   forKey:@"transitionRepair"];
    CGColorRelease(cream);
    return cover;
}

static CALayer *OutroCaptionLayer(double durationSeconds, CGImageRef graphic) {
    CALayer *group = [CALayer layer];
    group.frame = CGRectMake(0, 0, kWidth, kHeight);
    group.contents = (__bridge id)graphic;
    group.opacity = 0.0;
    double start = fmax(0.0, durationSeconds - 3.75);
    [group addAnimation:OpacityAnimation(start, 3.70,
                                         @[@0.0, @1.0, @1.0, @0.0],
                                         @[@0.0, @0.14, @0.88, @1.0])
                   forKey:@"outroCaption"];

    return group;
}

int main(int argc, const char *argv[]) {
    @autoreleasepool {
        if (argc != 4) {
            fprintf(stderr, "Uso: create_youtube_edit input.mp4 logo.png output.mp4\n");
            return 1;
        }

        NSString *inputPath = [NSString stringWithUTF8String:argv[1]];
        NSString *logoPath = [NSString stringWithUTF8String:argv[2]];
        NSString *outputPath = [NSString stringWithUTF8String:argv[3]];
        AVURLAsset *asset = [AVURLAsset URLAssetWithURL:[NSURL fileURLWithPath:inputPath] options:nil];
        AVAssetTrack *sourceVideo = [[asset tracksWithMediaType:AVMediaTypeVideo] firstObject];
        if (!sourceVideo) {
            fprintf(stderr, "No se encontró una pista de vídeo.\n");
            return 2;
        }

        AVMutableComposition *composition = [AVMutableComposition composition];
        AVMutableCompositionTrack *videoTrack = [composition addMutableTrackWithMediaType:AVMediaTypeVideo
                                                                         preferredTrackID:kCMPersistentTrackID_Invalid];
        NSError *error = nil;
        if (![videoTrack insertTimeRange:CMTimeRangeMake(kCMTimeZero, asset.duration)
                                 ofTrack:sourceVideo atTime:kCMTimeZero error:&error]) {
            NSLog(@"No se pudo insertar el vídeo: %@", error);
            return 3;
        }
        videoTrack.preferredTransform = sourceVideo.preferredTransform;

        for (AVAssetTrack *sourceAudio in [asset tracksWithMediaType:AVMediaTypeAudio]) {
            AVMutableCompositionTrack *audioTrack = [composition addMutableTrackWithMediaType:AVMediaTypeAudio
                                                                             preferredTrackID:kCMPersistentTrackID_Invalid];
            if (![audioTrack insertTimeRange:CMTimeRangeMake(kCMTimeZero, asset.duration)
                                     ofTrack:sourceAudio atTime:kCMTimeZero error:&error]) {
                NSLog(@"No se pudo insertar el audio: %@", error);
                return 4;
            }
        }

        AVMutableVideoCompositionInstruction *instruction = [AVMutableVideoCompositionInstruction videoCompositionInstruction];
        instruction.timeRange = CMTimeRangeMake(kCMTimeZero, asset.duration);
        AVMutableVideoCompositionLayerInstruction *layerInstruction =
            [AVMutableVideoCompositionLayerInstruction videoCompositionLayerInstructionWithAssetTrack:videoTrack];
        [layerInstruction setTransform:sourceVideo.preferredTransform atTime:kCMTimeZero];
        instruction.layerInstructions = @[layerInstruction];

        AVMutableVideoComposition *videoComposition = [AVMutableVideoComposition videoComposition];
        videoComposition.renderSize = CGSizeMake(kWidth, kHeight);
        videoComposition.frameDuration = CMTimeMake(1, 30);
        videoComposition.instructions = @[instruction];

        CGImageSourceRef imageSource = CGImageSourceCreateWithURL(
            (__bridge CFURLRef)[NSURL fileURLWithPath:logoPath], NULL);
        CGImageRef logoImage = imageSource ? CGImageSourceCreateImageAtIndex(imageSource, 0, NULL) : NULL;
        if (imageSource) CFRelease(imageSource);
        if (!logoImage) {
            fprintf(stderr, "No se pudo cargar el logotipo.\n");
            return 5;
        }

        CALayer *parentLayer = [CALayer layer];
        CALayer *videoLayer = [CALayer layer];
        parentLayer.frame = CGRectMake(0, 0, kWidth, kHeight);
        videoLayer.frame = parentLayer.frame;
        [parentLayer addSublayer:videoLayer];
        CGImageRef introGraphic = CreateIntroGraphic(logoImage);
        CGImageRef outroGraphic = CreateOutroGraphic();
        [parentLayer addSublayer:IntroLayer(introGraphic)];
        [parentLayer addSublayer:TransitionRepairLayer()];
        [parentLayer addSublayer:OutroCaptionLayer(CMTimeGetSeconds(asset.duration), outroGraphic)];
        CGImageRelease(introGraphic);
        CGImageRelease(outroGraphic);
        CGImageRelease(logoImage);

        videoComposition.animationTool =
            [AVVideoCompositionCoreAnimationTool videoCompositionCoreAnimationToolWithPostProcessingAsVideoLayer:videoLayer
                                                                                                   inLayer:parentLayer];

        NSURL *outputURL = [NSURL fileURLWithPath:outputPath];
        [[NSFileManager defaultManager] removeItemAtURL:outputURL error:nil];
        AVAssetExportSession *exporter = [[AVAssetExportSession alloc]
            initWithAsset:composition presetName:AVAssetExportPreset1920x1080];
        if (!exporter) return 6;
        exporter.outputURL = outputURL;
        exporter.outputFileType = AVFileTypeMPEG4;
        exporter.shouldOptimizeForNetworkUse = YES;
        exporter.videoComposition = videoComposition;

        dispatch_semaphore_t semaphore = dispatch_semaphore_create(0);
        [exporter exportAsynchronouslyWithCompletionHandler:^{ dispatch_semaphore_signal(semaphore); }];
        dispatch_semaphore_wait(semaphore, DISPATCH_TIME_FOREVER);
        if (exporter.status != AVAssetExportSessionStatusCompleted) {
            NSLog(@"Error de exportación: %@", exporter.error);
            return 7;
        }
        printf("%s\n", outputPath.UTF8String);
    }
    return 0;
}
