export declare const joinQueue: (eventId: string, userId: string) => Promise<{
    status: string;
    alreadyInQueue: boolean;
    position?: never;
} | {
    status: string;
    position: any;
    alreadyInQueue: boolean;
}>;
export declare const getQueueStatus: (eventId: string, userId: string) => Promise<{
    status: string;
    position?: never;
} | {
    status: string;
    position: any;
}>;
export declare const expirePromotions: () => Promise<void>;
export declare const promoteFromQueue: (eventId: string, count?: number) => Promise<string[]>;
//# sourceMappingURL=queueService.d.ts.map