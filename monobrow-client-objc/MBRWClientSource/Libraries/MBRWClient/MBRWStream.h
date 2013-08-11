//
//  MBRWStream.h
//  MonobrowObjectiveC
//
//  Created by Eric McGary on 8/8/13.
//  Copyright (c) 2013 Resource. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface MBRWStream : NSStream

+ (void)readStreamFromHostNamed:(NSString *)hostName
                           port:(NSInteger)port
                     readStream:(out NSInputStream **)readStreamPtr;

@end
