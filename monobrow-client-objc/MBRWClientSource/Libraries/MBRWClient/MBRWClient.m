//
//  MBClient.m
//  MonobrowObjectiveC
//
//  Created by Eric McGary on 8/5/13.
//  Copyright (c) 2013 Resource. All rights reserved.
//

#import "MBRWClient.h"

@interface MBRWClient()
{
    NSString* _host;
    NSNumber* _port;
   NSInputStream* _inputStream;
   NSOutputStream* _outputStream;
    NSMutableData* _recievedData;
}

@property (nonatomic,strong) NSOperationQueue* queue;

@end

@implementation MBRWClient

#pragma mark - Initialization

-(id) initWithHost:(NSString *)host
       andWithPort:(NSNumber *)port
{
    if(self=[super init])
    {
        _host = host;
        _port = port;
    }
    return self;
}

#pragma mark - Public Methods

-(void) connect
{
    NSInputStream *readStream;
    [MBRWStream readStreamFromHostNamed:@"127.0.0.1"
                                 port:8889
                           readStream:&readStream];
    
    _queue = [[NSOperationQueue alloc] init];
    [readStream setDelegate:self];

    [_queue addOperationWithBlock:^{
        [readStream scheduleInRunLoop:[NSRunLoop currentRunLoop] forMode:NSDefaultRunLoopMode];
        [readStream open];
        [[NSRunLoop currentRunLoop] run];
    }];
    
}

-(void) disconnect
{
    [_inputStream close];
    //[_outputStream close];
}

-(void) sendMessageWithType:(NSString *)type
                andWithData:(NSDictionary *)data
{
    
}

#pragma mark - Getters/Setters

-(NSURL*) address
{
    NSString* urlString = [NSString stringWithFormat:@"%@:%@",_host,_port];
    NSLog(@"%@",urlString);
    return [NSURL URLWithString:urlString];
}

#pragma mark - NSInputStreamDelegate Methods

- (void)stream:(NSStream *)aStream
   handleEvent:(NSStreamEvent)eventCode
{
    switch (eventCode)
    {
        case NSStreamEventHasBytesAvailable:
                        
            _recievedData = [[NSMutableData alloc] init];
            
            uint8_t buf[100000];
            int numBytesRead = [(NSInputStream *)aStream read:buf maxLength:100000];
            
            if (numBytesRead > 0)
            {
                [_recievedData appendBytes:(const void *)buf length:numBytesRead];
                [self __handleSocketData];
            }
            /*
            else if (numBytesRead == 0)
            {
                NSLog(@"End of stream reached");
                [self __handleSocketData];
            }
            else
            {
                NSLog(@"Read error occurred");
            }
             */
            
            
            
            break;
        case NSStreamEventNone:
            if (_delegate && [_delegate respondsToSelector:@selector(client:handleStateChangeEvent:)])
            {
                [_delegate client:self handleStateChangeEvent:MBRWErrorState];
            }
            break;
            
        case NSStreamEventOpenCompleted:
            if (_delegate && [_delegate respondsToSelector:@selector(client:handleStateChangeEvent:)])
            {
                [_delegate client:self handleStateChangeEvent:MBRWConnectedState];
            }
            break;
            
        case NSStreamEventErrorOccurred:
            if (_delegate && [_delegate respondsToSelector:@selector(client:handleStateChangeEvent:)])
            {
                [_delegate client:self handleStateChangeEvent:MBRWErrorState];
            }
            break;
            
        case NSStreamEventEndEncountered:
            if (_delegate && [_delegate respondsToSelector:@selector(client:handleStateChangeEvent:)])
            {
                [_delegate client:self handleStateChangeEvent:MBRWDisconnectedState];
            }
            break;
            
        default:
            // unknown or untracked event
            break;
    }
}

-(void) __handleSocketData
{
    
    NSArray* messages = [[[NSString alloc] initWithData:_recievedData encoding:NSUTF8StringEncoding] componentsSeparatedByString:@"~~~"];
    
    for (NSUInteger i = 0; i < messages.count; i++)
    {
        NSError* error;
        if ([[messages objectAtIndex:i] isEqualToString:@""]) return;
        NSData* data = [(NSString*)[messages objectAtIndex:i] dataUsingEncoding:NSUTF8StringEncoding];
        NSDictionary* message = [NSJSONSerialization JSONObjectWithData:data
                                                                options:0
                                                                  error:&error];
        
        NSString* type = [message objectForKey:@"type"];
        NSObject* body = [message objectForKey:@"data"];
        
        [[NSOperationQueue mainQueue] addOperationWithBlock:^{
            if (_delegate && [_delegate respondsToSelector:@selector(client:handleMessageEvent:withData:)])
            {
                [_delegate client:self handleMessageEvent:type withData:body];
            }
        }];
    }
    
}

@end
