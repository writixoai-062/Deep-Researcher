import { Router, type IRouter } from "express";
import healthRouter from "./health";
import analyzeRouter from "./analyze";
import agentRouter from "./agent";
import adaptiveRouter from "./adaptive";
import paymentsRouter from "./payments";

const router: IRouter = Router();

router.use(healthRouter);
router.use(analyzeRouter);
router.use(agentRouter);
router.use(adaptiveRouter);
router.use(paymentsRouter);

export default router;
