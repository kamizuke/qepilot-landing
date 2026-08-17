#import <AVFoundation/AVFoundation.h>
#import <CoreGraphics/CoreGraphics.h>
#import <CoreVideo/CoreVideo.h>
#import <Foundation/Foundation.h>
#import <ImageIO/ImageIO.h>
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

static void DrawFrame(CVPixelBufferRef pixelBuffer, CGImageRef logoFrame, double time, BOOL isOutro) {
    CVPixelBufferLockBaseAddress(pixelBuffer, 0);
    void *base = CVPixelBufferGetBaseAddress(pixelBuffer);
    size_t bytesPerRow = CVPixelBufferGetBytesPerRow(pixelBuffer);
    CGColorSpaceRef colorSpace = CGColorSpaceCreateDeviceRGB();
    CGContextRef context = CGBitmapContextCreate(base, kWidth, kHeight, 8, bytesPerRow, colorSpace,
                                                  kCGImageAlphaNoneSkipFirst);
    CGColorSpaceRelease(colorSpace);

    CGFloat creamComponents[] = {247.0 / 255.0, 246.0 / 255.0, 242.0 / 255.0, 1.0};
    CGFloat blueComponents[] = {18.0 / 255.0, 119.0 / 255.0, 235.0 / 255.0, 1.0};
    CGColorRef cream = CGColorCreate(CGColorSpaceCreateDeviceRGB(), creamComponents);
    CGColorRef blue = CGColorCreate(CGColorSpaceCreateDeviceRGB(), blueComponents);

    CGContextSetFillColorWithColor(context, cream);
    CGContextFillRect(context, CGRectMake(0, 0, kWidth, kHeight));
    double logoAlpha = isOutro
        ? 1.0 - Smoothstep((time - 2.85) / 0.75)
        : Smoothstep((time - 0.15) / 0.48);
    CGContextSaveGState(context);
    CGContextSetAlpha(context, logoAlpha);
    CGContextDrawImage(context, CGRectMake(0, 0, kWidth, kHeight), logoFrame);
    CGContextRestoreGState(context);

    // Hide only the three dots embedded in the master artwork.
    CGContextSetFillColorWithColor(context, cream);
    CGContextFillRect(context, CGRectMake(528, kHeight - 522, 120, 34));

    CGPoint centers[] = {
        CGPointMake(545, kHeight - 504),
        CGPointMake(588, kHeight - 504),
        CGPointMake(630, kHeight - 504)
    };
    double introStarts[] = {0.72, 1.02, 1.32};
    double outroStarts[] = {0.80, 1.10, 1.40};
    for (int index = 0; index < 3; index++) {
        double progress;
        if (isOutro && time < 0.48) {
            progress = 1.0 - Smoothstep((time - 0.28) / 0.20);
        } else {
            double start = isOutro ? outroStarts[index] : introStarts[index];
            progress = Smoothstep((time - start) / 0.22);
        }
        progress *= logoAlpha;
        CGFloat scale = 0.78 + 0.22 * Smoothstep(progress);
        CGFloat radius = 12.5 * scale;
        CGRect dot = CGRectMake(centers[index].x - radius, centers[index].y - radius, radius * 2, radius * 2);
        CGContextSetAlpha(context, progress);
        CGContextSetFillColorWithColor(context, blue);
        CGContextFillEllipseInRect(context, dot);
        CGContextSetAlpha(context, 1.0);
    }

    CGColorRelease(cream);
    CGColorRelease(blue);
    CGContextRelease(context);
    CVPixelBufferUnlockBaseAddress(pixelBuffer, 0);
}

static BOOL Render(NSURL *outputURL, CGImageRef logoFrame, BOOL isOutro, NSError **renderError) {
    [[NSFileManager defaultManager] removeItemAtURL:outputURL error:nil];
    AVAssetWriter *writer = [[AVAssetWriter alloc] initWithURL:outputURL fileType:AVFileTypeMPEG4 error:renderError];
    if (!writer) return NO;

    NSDictionary *compression = @{
        AVVideoAverageBitRateKey: @8000000,
        AVVideoProfileLevelKey: AVVideoProfileLevelH264HighAutoLevel
    };
    NSDictionary *settings = @{
        AVVideoCodecKey: AVVideoCodecTypeH264,
        AVVideoWidthKey: @(kWidth),
        AVVideoHeightKey: @(kHeight),
        AVVideoCompressionPropertiesKey: compression
    };
    AVAssetWriterInput *input = [AVAssetWriterInput assetWriterInputWithMediaType:AVMediaTypeVideo
                                                                    outputSettings:settings];
    input.expectsMediaDataInRealTime = NO;
    NSDictionary *attributes = @{
        (NSString *)kCVPixelBufferPixelFormatTypeKey: @(kCVPixelFormatType_32ARGB),
        (NSString *)kCVPixelBufferWidthKey: @(kWidth),
        (NSString *)kCVPixelBufferHeightKey: @(kHeight)
    };
    AVAssetWriterInputPixelBufferAdaptor *adaptor =
        [AVAssetWriterInputPixelBufferAdaptor assetWriterInputPixelBufferAdaptorWithAssetWriterInput:input
                                                                         sourcePixelBufferAttributes:attributes];
    if (![writer canAddInput:input]) return NO;
    [writer addInput:input];
    if (![writer startWriting]) {
        if (renderError) *renderError = writer.error;
        return NO;
    }
    [writer startSessionAtSourceTime:kCMTimeZero];

    int frameCount = (int)(kDuration * kFPS);
    for (int frame = 0; frame < frameCount; frame++) {
        while (!input.readyForMoreMediaData) usleep(2000);
        CVPixelBufferRef pixelBuffer = NULL;
        CVReturn result = CVPixelBufferPoolCreatePixelBuffer(NULL, adaptor.pixelBufferPool, &pixelBuffer);
        if (result != kCVReturnSuccess || !pixelBuffer) return NO;
        DrawFrame(pixelBuffer, logoFrame, (double)frame / kFPS, isOutro);
        CMTime timestamp = CMTimeMake(frame, kFPS);
        if (![adaptor appendPixelBuffer:pixelBuffer withPresentationTime:timestamp]) {
            CVPixelBufferRelease(pixelBuffer);
            if (renderError) *renderError = writer.error;
            return NO;
        }
        CVPixelBufferRelease(pixelBuffer);
    }

    [input markAsFinished];
    dispatch_semaphore_t semaphore = dispatch_semaphore_create(0);
    [writer finishWritingWithCompletionHandler:^{ dispatch_semaphore_signal(semaphore); }];
    dispatch_semaphore_wait(semaphore, DISPATCH_TIME_FOREVER);
    if (writer.status != AVAssetWriterStatusCompleted) {
        if (renderError) *renderError = writer.error;
        return NO;
    }
    return YES;
}

int main(void) {
    @autoreleasepool {
        NSString *workspace = [[NSFileManager defaultManager] currentDirectoryPath];
        NSURL *sourceURL = [NSURL fileURLWithPath:[workspace stringByAppendingPathComponent:@"evidran-brand-frame-16x9.png"]];
        CGImageSourceRef imageSource = CGImageSourceCreateWithURL((__bridge CFURLRef)sourceURL, NULL);
        if (!imageSource) return 1;
        CGImageRef logoFrame = CGImageSourceCreateImageAtIndex(imageSource, 0, NULL);
        CFRelease(imageSource);
        if (!logoFrame) return 1;

        NSURL *introURL = [NSURL fileURLWithPath:[workspace stringByAppendingPathComponent:@"evidran-entrada-puntos.mp4"]];
        NSURL *outroURL = [NSURL fileURLWithPath:[workspace stringByAppendingPathComponent:@"evidran-salida-puntos.mp4"]];
        NSError *error = nil;
        BOOL introOK = Render(introURL, logoFrame, NO, &error);
        if (!introOK) {
            NSLog(@"Error en entrada: %@", error);
            CGImageRelease(logoFrame);
            return 2;
        }
        BOOL outroOK = Render(outroURL, logoFrame, YES, &error);
        CGImageRelease(logoFrame);
        if (!outroOK) {
            NSLog(@"Error en salida: %@", error);
            return 3;
        }
        printf("%s\n%s\n", introURL.path.UTF8String, outroURL.path.UTF8String);
    }
    return 0;
}
