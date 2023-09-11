import { Request, Response } from "express";

export function getId(req: Request, res: Response) {
	const auth = req.headers.authorization;
	if (!auth || !auth.startsWith("Bearer ")) {
		res.status(400).json({ success: false, error: "Invalid header" });
		return undefined;
	};
	const id = auth.split(" ")[1];
	if (!/^[\w\d]{12}$/.test(id)) {
		res.status(400).json({ success: false, error: "Invalid ID" });
		return undefined;
	}
	return id;
}