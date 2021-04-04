import { NextFunction, Request, Response } from "express";

const asyncMiddleware = (fn: Function) => {
	return (req: Request, res: Response, next: NextFunction) => {
			fn(req, res, next).catch(next);
	};
};

export { asyncMiddleware };
