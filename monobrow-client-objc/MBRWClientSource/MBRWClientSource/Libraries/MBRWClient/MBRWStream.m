//
//  MBRWStream.m
//  MonobrowObjectiveC
//
//  Created by Eric McGary on 8/8/13.
//  Copyright (c) 2013 Resource. All rights reserved.
//

#import "MBRWStream.h"

@implementation MBRWStream

+ (void)readStreamFromHostNamed:(NSString *)hostName
                           port:(NSInteger)port
                     readStream:(out NSInputStream **)readStreamPtr {
    
    assert(hostName != nil);
    assert((port > 0) && (port < 65536));
    assert((readStreamPtr != NULL));
    
    CFReadStreamRef readStream = NULL;
    
    CFStreamCreatePairWithSocketToHost(NULL,
                                       (__bridge CFStringRef) hostName,
                                       port,
                                       ((readStreamPtr != NULL) ? &readStream :
                                        NULL),
                                       NULL);
    
    if (readStreamPtr != NULL) {
        *readStreamPtr  = CFBridgingRelease(readStream);
    }
}

@end
