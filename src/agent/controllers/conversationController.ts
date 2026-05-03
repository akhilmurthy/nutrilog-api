import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth';
import { ConversationService } from '../services/conversationService';

export const sendMessage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const { conversationId, message } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    const response = await ConversationService.sendMessage(userId, {
      conversationId,
      message: message.trim(),
    });

    res.status(200).json(response);
  } catch (error: any) {
    console.error('Error in sendMessage:', error);

    if (error.message === 'Conversation not found') {
      res.status(404).json({ error: error.message });
      return;
    }

    if (error.message === 'Unauthorized') {
      res.status(403).json({ error: error.message });
      return;
    }

    next(error);
  }
};

export const listConversations = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const limit = parseInt(req.query.limit as string) || 20;

    const conversations = await ConversationService.listConversations(userId, limit);

    res.status(200).json(conversations);
  } catch (error) {
    console.error('Error in listConversations:', error);
    next(error);
  }
};

export const getConversation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const { id } = req.params;

    const conversation = await ConversationService.getConversation(id, userId);

    if (!conversation) {
      res.status(404).json({ error: 'Conversation not found' });
      return;
    }

    res.status(200).json(conversation);
  } catch (error: any) {
    console.error('Error in getConversation:', error);

    if (error.message === 'Unauthorized') {
      res.status(403).json({ error: error.message });
      return;
    }

    next(error);
  }
};

export const deleteConversation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const { id } = req.params;

    await ConversationService.deleteConversation(id, userId);

    res.status(204).send();
  } catch (error: any) {
    console.error('Error in deleteConversation:', error);

    if (error.message === 'Conversation not found') {
      res.status(404).json({ error: error.message });
      return;
    }

    next(error);
  }
};

export const sendMessageStream = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const { conversationId, message } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering
    res.flushHeaders();

    const stream = ConversationService.sendMessageStream(userId, {
      conversationId,
      message: message.trim(),
    });

    for await (const event of stream) {
      res.write(`data: ${JSON.stringify(event)}\n\n`);
    }

    res.end();
  } catch (error: any) {
    console.error('Error in sendMessageStream:', error);

    // If headers already sent, write error as SSE event
    if (res.headersSent) {
      res.write(`data: ${JSON.stringify({ type: 'error', message: error.message })}\n\n`);
      res.end();
      return;
    }

    if (error.message === 'Conversation not found') {
      res.status(404).json({ error: error.message });
      return;
    }

    if (error.message === 'Unauthorized') {
      res.status(403).json({ error: error.message });
      return;
    }

    next(error);
  }
};
