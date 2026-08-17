#import <AVFoundation/AVFoundation.h>
#import <CoreGraphics/CoreGraphics.h>
#import <CoreMedia/CoreMedia.h>
#import <CoreText/CoreText.h>
#import <CoreVideo/CoreVideo.h>
#import <Foundation/Foundation.h>
#include <math.h>
#include <unistd.h>

static const int kWidth = 1920;
static const int kHeight = 1080;
static const int kFPS = 30;
static const double kDuration = 4.0;

static double Clamp(double value) { return fmin(1.0, fmax(0.0, value)); }
static double Smoothstep(double value) {
    double x = Clamp(value);
    return x * x * (3.0 - 2.0 * x);
}

static void DrawCenteredText(CGContextRef context, NSString *text, CGFloat size,
                             CGColorRef color, CGFloat baselineY, CGFloat alpha) {
    CTFontRef font = CTFontCreateWithName(CFSTR("Inter Tight SemiBold"), size, NULL);
    if (!font) font = CTFontCreateWithName(CFSTR("Helvetica Neue Bold"), size, NULL);
    NSDictionary *attributes = @{
        (__bridge NSString *)kCTFontAttributeName: (__bridge id)font,
        (__bridge NSString *)kCTForegroundColorAttributeName: (__bridge id)color,
        (__bridge NSString *)kCTKernAttributeName: @(-1.2)
    };
    NSAttributedString *attributed = [[NSAttributedString alloc] initWithString:text attributes:attributes];
    CTLineRef line = CTLineCreateWithAttributedString((__bridge CFAttributedStringRef)attributed);
    CGFloat lineWidth = (CGFloat)CTLineGetTypographicBounds(line, NULL, NULL, NULL);

    CGContextSaveGState(context);
    CGContextSetAlpha(context, alpha);
    CGContextSetTextMatrix(context, CGAffineTransformIdentity);
    CGContextSetTextPosition(context, (kWidth - lineWidth) / 2.0, baselineY);
    CTLineDraw(line, context);
    CGContextRestoreGState(context);

    CFRelease(line);
    CFRelease(font);
}

static void DrawFrame(CVPixelBufferRef pixelBuffer, double time) {
    CVPixelBufferLockBaseAddress(pixelBuffer, 0);
    void *base = CVPixelBufferGetBaseAddress(pixelBuffer);
    size_t bytesPerRow = CVPixelBufferGetBytesPerRow(pixelBuffer);
    CGColorSpaceRef colorSpace = CGColorSpaceCreateDeviceRGB();
    CGContextRef context = CGBitmapContextCreate(base, kWidth, kHeight, 8, bytesPerRow, colorSpace,
                                                  kCGImageAlphaNoneSkipFirst);

    CGFloat creamValues[] = {247.0 / 255.0, 246.0 / 255.0, 242.0 / 255.0, 1.0};
    CGFloat blueValues[] = {18.0 / 255.0, 119.0 / 255.0, 235.0 / 255.0, 1.0};
    CGFloat navyValues[] = {2.0 / 255.0, 26.0 / 255.0, 73.0 / 255.0, 1.0};
    CGColorRef cream = CGColorCreate(colorSpace, creamValues);
    CGColorRef blue = CGColorCreate(colorSpace, blueValues);
    CGColorRef navy = CGColorCreate(colorSpace, navyValues);

    CGContextSetFillColorWithColor(context, cream);
    CGContextFillRect(context, CGRectMake(0, 0, kWidth, kHeight));

    double exitAlpha = 1.0 - Smoothstep((time - 3.45) / 0.42);
    double dotStarts[] = {0.40, 0.70, 1.00};
    CGFloat dotXs[] = {910, 960, 1010};
    for (int index = 0; index < 3; index++) {
        double progress = Smoothstep((time - dotStarts[index]) / 0.20) * exitAlpha;
        CGFloat radius = 11.0 * (0.78 + 0.22 * Smoothstep(progress));
        // Quartz bitmap coordinates are vertically inverted in the encoded frame.
        CGFloat quartzY = kHeight - 408;
        CGRect dot = CGRectMake(dotXs[index] - radius, quartzY - radius, radius * 2, radius * 2);
        CGContextSetAlpha(context, progress);
        CGContextSetFillColorWithColor(context, blue);
        CGContextFillEllipseInRect(context, dot);
    }
    CGContextSetAlpha(context, 1.0);

    double firstAlpha = Smoothstep((time - 1.18) / 0.32) * exitAlpha;
    double secondAlpha = Smoothstep((time - 1.45) / 0.32) * exitAlpha;
    DrawCenteredText(context, @"La misma no conformidad.", 64, navy, 565, firstAlpha);
    DrawCenteredText(context, @"Otra forma de gestionarla.", 64, blue, 480, secondAlpha);

    CGColorRelease(cream);
    CGColorRelease(blue);
    CGColorRelease(navy);
    CGColorSpaceRelease(colorSpace);
    CGContextRelease(context);
    CVPixelBufferUnlockBaseAddress(pixelBuffer, 0);
}

int main(void) {
    @autoreleasepool {
        NSString *path = [[[NSFileManager defaultManager] currentDirectoryPath]
            stringByAppendingPathComponent:@"evidran-transicion-word-a-evidran.mp4"];
        NSURL *outputURL = [NSURL fileURLWithPath:path];
        [[NSFileManager defaultManager] removeItemAtURL:outputURL error:nil];

        NSError *error = nil;
        AVAssetWriter *writer = [[AVAssetWriter alloc] initWithURL:outputURL
                                                          fileType:AVFileTypeMPEG4
                                                             error:&error];
        NSDictionary *settings = @{
            AVVideoCodecKey: AVVideoCodecTypeH264,
            AVVideoWidthKey: @(kWidth),
            AVVideoHeightKey: @(kHeight),
            AVVideoCompressionPropertiesKey: @{
                AVVideoAverageBitRateKey: @8000000,
                AVVideoProfileLevelKey: AVVideoProfileLevelH264HighAutoLevel
            }
        };
        AVAssetWriterInput *input = [AVAssetWriterInput assetWriterInputWithMediaType:AVMediaTypeVideo
                                                                        outputSettings:settings];
        input.expectsMediaDataInRealTime = NO;
        NSDictionary *pixelAttributes = @{
            (NSString *)kCVPixelBufferPixelFormatTypeKey: @(kCVPixelFormatType_32ARGB),
            (NSString *)kCVPixelBufferWidthKey: @(kWidth),
            (NSString *)kCVPixelBufferHeightKey: @(kHeight)
        };
        AVAssetWriterInputPixelBufferAdaptor *adaptor =
            [AVAssetWriterInputPixelBufferAdaptor assetWriterInputPixelBufferAdaptorWithAssetWriterInput:input
                                                                             sourcePixelBufferAttributes:pixelAttributes];
        [writer addInput:input];
        if (![writer startWriting]) {
            NSLog(@"No se pudo iniciar el render: %@", writer.error);
            return 1;
        }
        [writer startSessionAtSourceTime:kCMTimeZero];

        int totalFrames = (int)(kDuration * kFPS);
        for (int frame = 0; frame < totalFrames; frame++) {
            while (!input.readyForMoreMediaData) usleep(2000);
            CVPixelBufferRef pixelBuffer = NULL;
            CVPixelBufferPoolCreatePixelBuffer(NULL, adaptor.pixelBufferPool, &pixelBuffer);
            if (!pixelBuffer) return 2;
            DrawFrame(pixelBuffer, (double)frame / kFPS);
            BOOL appended = [adaptor appendPixelBuffer:pixelBuffer
                                  withPresentationTime:CMTimeMake(frame, kFPS)];
            CVPixelBufferRelease(pixelBuffer);
            if (!appended) return 3;
        }
        [input markAsFinished];
        dispatch_semaphore_t semaphore = dispatch_semaphore_create(0);
        [writer finishWritingWithCompletionHandler:^{ dispatch_semaphore_signal(semaphore); }];
        dispatch_semaphore_wait(semaphore, DISPATCH_TIME_FOREVER);
        if (writer.status != AVAssetWriterStatusCompleted) {
            NSLog(@"Error de render: %@", writer.error);
            return 4;
        }
        printf("%s\n", path.UTF8String);
    }
    return 0;
}
