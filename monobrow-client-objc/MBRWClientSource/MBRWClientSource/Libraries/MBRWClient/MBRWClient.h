//
//  MBClient.h
//  MonobrowObjectiveC
//
//  Created by Eric McGary on 8/5/13.
//  Copyright (c) 2013 Resource. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "MBRWStream.h"

typedef enum : NSInteger
{
    MBRWConnectedState,
    MBRWDisconnectedState,
    MBRWErrorState
} MBRWClientState;

@protocol MBRWClientDelegate;

@interface MBRWClient : NSObject <NSStreamDelegate>

@property (nonatomic) MBRWClientState state;
@property (nonatomic) MBRWClientState previousState;
@property (nonatomic,strong) NSURL* address;
@property (nonatomic) id<MBRWClientDelegate> delegate;

-(id) initWithHost:(NSString*) host andWithPort:(NSNumber*) port;
-(void) connect;
-(void) disconnect;
-(void) sendMessageWithType:(NSString*) type andWithData:(NSDictionary*) data;

@end

@protocol MBRWClientDelegate <NSObject>

@optional

- (void)client:(MBRWClient *)client handleStateChangeEvent:(MBRWClientState)state;
- (void)client:(MBRWClient *)client handleMessageEvent:(NSString*)stateName withData:(NSObject*) data;

@end
