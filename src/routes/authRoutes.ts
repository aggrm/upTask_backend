import { Router } from "express";

const router = Router()
console.log('🔥 AUTH ROUTES CARGADAS');

router.get('/', (_, res) => {
  res.send('auth root OK');
});

export default router