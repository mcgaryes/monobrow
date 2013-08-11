//
//  MainViewController.m
//  MBRWClientSource
//
//  Created by Eric McGary on 8/11/13.
//  Copyright (c) 2013 Eric McGary. All rights reserved.
//

#import "MainViewController.h"

@interface MainViewController ()

@property (nonatomic,strong) MBRWClient* client;

@end

@implementation MainViewController

-(id) initWithCoder:(NSCoder *)aDecoder
{
    if(self = [super initWithCoder:aDecoder])
    {
        NSLog(@"initialized");
        _client = [[MBRWClient alloc] initWithHost:@"127.0.0.1"
                                       andWithPort:@8889];
        _client.delegate = self;
    }
    return self;
}

- (IBAction)connectButtonClick:(id)sender
{
    [_client connect];
}

#pragma mark - MBRWClientDelegate Methods

- (void)client:(MBRWClient *)client handleStateChangeEvent:(MBRWClientState)state
{
    if(state == MBRWConnectedState)
    {
        NSLog(@"Connected to server.");
    }
    else if (state == MBRWErrorState)
    {
        NSLog(@"Error connecting to server.");
    }
}

- (void)client:(MBRWClient *)client handleMessageEvent:(NSString*)stateName withData:(NSObject*) data
{
    // ...
}


@end
