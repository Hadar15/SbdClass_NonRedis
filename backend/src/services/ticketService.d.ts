export declare const reserveTicket: (eventId: string, userId: string) => Promise<{
    success: boolean;
    message: string;
    expiresAt: number;
}>;
export declare const confirmPayment: (eventId: string, userId: string) => Promise<{
    success: boolean;
    transaction: {
        id: any;
        userId: any;
        eventId: any;
        status: any;
        seatDetails: any;
        expiresAt: any;
        createdAt: any;
        updatedAt: any;
    };
}>;
export declare const getTicketStatus: (eventId: string, userId: string) => Promise<{
    status: string;
    remainingTime?: never;
} | {
    status: string;
    remainingTime: number;
}>;
export declare const expireReservations: () => Promise<void>;
export declare const getEventStock: (eventId: string) => Promise<number>;
//# sourceMappingURL=ticketService.d.ts.map