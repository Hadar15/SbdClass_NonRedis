import type { Request, Response } from 'express';
export declare const joinQueue: (req: Request, res: Response) => Promise<void>;
export declare const getQueueStatus: (req: Request, res: Response) => Promise<void>;
export declare const reserveTicket: (req: Request, res: Response) => Promise<void>;
export declare const confirmPayment: (req: Request, res: Response) => Promise<void>;
export declare const getTicketStatus: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=ticketController.d.ts.map