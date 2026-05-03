import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import {
  sendMessage,
  sendMessageStream,
  listConversations,
  getConversation,
  deleteConversation,
} from '../controllers/conversationController';
import {
  listMealPlans,
  getMealPlan,
  getActiveMealPlan,
  updateMealPlan,
  deleteMealPlan,
  activateMealPlan,
  logMealPlanDay,
} from '../controllers/mealPlanController';

const router = Router();

// All agent routes require authentication
router.use(authenticate);

// Chat endpoints - send a message and get a response
router.post('/chat', sendMessage);
router.post('/chat/stream', sendMessageStream);

// Conversation management
router.get('/conversations', listConversations);
router.get('/conversations/:id', getConversation);
router.delete('/conversations/:id', deleteConversation);

// Meal plan management
router.get('/meal-plans', listMealPlans);
router.get('/meal-plans/active', getActiveMealPlan);
router.get('/meal-plans/:id', getMealPlan);
router.put('/meal-plans/:id', updateMealPlan);
router.delete('/meal-plans/:id', deleteMealPlan);
router.post('/meal-plans/:id/activate', activateMealPlan);
router.post('/meal-plans/:id/log/:dayNumber', logMealPlanDay);

export default router;
