import { Router } from 'express';
import authRoutes from './authRoutes.js';
import productorRoutes from './productorRoutes.js';
import compradorRoutes from './compradorRoutes.js';
import productoRoutes from './productoRoutes.js';
import transaccionRoutes from './transaccionRoutes.js';
import chatRoutes from './chatRoutes.js';

const router = Router();

router.get('/salud', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'API Plataforma Productores - Mercados Urbanos operativa.'
  });
});

router.use('/auth', authRoutes);
router.use('/productores', productorRoutes);
router.use('/compradores', compradorRoutes);
router.use('/productos', productoRoutes);
router.use('/transacciones', transaccionRoutes);
router.use('/chats', chatRoutes);

export default router;