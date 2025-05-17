import React from 'react';

// Constantes para la gestión de tokens
export const INITIAL_TOKENS = 2500; // Saldo inicial de 2500 monedas
export const TOKENS_PER_COIN = 100; // 1 moneda = 100 tokens

// Opciones de compra de créditos: solo un pack de 1000 créditos por 5€
export const TOKEN_PACKS = [
  { amount: 1000, price: 5, description: "Pack único - 1000 créditos por 5€" }
];

export const PROMO_CODES = {
  'PROMO123': 200 // 200 monedas adicionales
};

// Códigos promocionales de créditos (+200 cada uno)
export const PROMO_CREDIT_CODES = {
  PAPITO1830: 200
};

// Cache para respuestas de la IA
const responseCache = new Map();

// Funciones de utilidad para la gestión de tokens
export function getTokenBalance() {
  const balance = localStorage.getItem('tokenBalance');
  if (!balance) {
    localStorage.setItem('tokenBalance', INITIAL_TOKENS.toString());
    return INITIAL_TOKENS;
  }
  return parseInt(balance);
}

export function updateTokenBalance(newBalance) {
  // Asegurarse de que el saldo nunca sea negativo
  const finalBalance = Math.max(0, newBalance);
  localStorage.setItem('tokenBalance', finalBalance.toString());
  return finalBalance;
}

export function calculateTokensToCoins(tokens) {
  // Convertir tokens a monedas, redondeando hacia arriba
  return Math.ceil(tokens / TOKENS_PER_COIN);
}

export function calculateTokenUsage(response) {
  if (!response?.usage) return 10; // Consumo mínimo por defecto
  
  const promptTokens = response.usage.prompt_tokens || 0;
  const completionTokens = response.usage.completion_tokens || 0;
  const totalTokens = promptTokens + completionTokens;
  
  // Convertir tokens a monedas (1 moneda = 100 tokens)
  return Math.ceil(totalTokens / TOKENS_PER_COIN);
}

export function hasEnoughTokens(currentBalance, estimatedTokens = 1000) {
  // Si no se proporciona estimatedTokens, asumimos un costo estimado de 10 monedas
  const requiredCoins = estimatedTokens ? Math.ceil(estimatedTokens / TOKENS_PER_COIN) : 10;
  return currentBalance >= requiredCoins;
}

export function deductTokens(currentBalance, tokensUsed) {
  const coinsToDeduct = calculateTokensToCoins(tokensUsed);
  const newBalance = Math.max(0, currentBalance - coinsToDeduct);
  updateTokenBalance(newBalance);
  return {
    newBalance,
    coinsDeducted: coinsToDeduct
  };
}

export function getModelName() {
  // return 'GPT-3.5-turbo'; // Eliminado: no usamos GPT-3.5
  return 'Llama 3 (Groq)';
}

export function applyPromoCode(code) {
  const bonus = PROMO_CODES[code];
  if (bonus) {
    const currentBalance = getTokenBalance();
    updateTokenBalance(currentBalance + bonus);
    return true;
  }
  return false;
}

// Función para cachear y recuperar respuestas
export function getCachedResponse(prompt) {
  return responseCache.get(prompt);
}

export function setCachedResponse(prompt, response) {
  responseCache.set(prompt, response);
  // Limitar el tamaño del cache a 100 entradas
  if (responseCache.size > 100) {
    const firstKey = responseCache.keys().next().value;
    responseCache.delete(firstKey);
  }
}

// Función para verificar si hay suficiente saldo antes de una operación
export function checkSufficientBalance(estimatedTokens = 1000) {
  const currentBalance = getTokenBalance();
  const requiredCoins = Math.ceil(estimatedTokens / TOKENS_PER_COIN);
  
  if (currentBalance < requiredCoins) {
    throw new Error('INSUFFICIENT_TOKENS');
  }
  
  return true;
}

// Función para registrar el uso de tokens
export function logTokenUsage(userId, tokensUsed, coinsDeducted) {
  const usage = {
    userId,
    tokensUsed,
    coinsDeducted,
    timestamp: new Date().toISOString()
  };
  
  // Guardar en localStorage temporalmente hasta implementar Supabase
  const usageHistory = JSON.parse(localStorage.getItem('tokenUsageHistory') || '[]');
  usageHistory.push(usage);
  localStorage.setItem('tokenUsageHistory', JSON.stringify(usageHistory));
  
  return usage;
}

// Nuevas funciones y constantes para la gestión de créditos
export const INITIAL_CREDITS_GUEST = 100;
export const INITIAL_CREDITS_REGISTERED = 250;
export const CREDITS_PER_IMAGE = 8;
export const CREDITS_PER_STORY = 3;

export function getCreditBalance(isRegistered) {
  if (isRegistered) {
    // TODO: Leer de Supabase
    const balance = localStorage.getItem('creditBalanceRegistered');
    if (!balance) {
      localStorage.setItem('creditBalanceRegistered', INITIAL_CREDITS_REGISTERED.toString());
      return INITIAL_CREDITS_REGISTERED;
    }
    return parseInt(balance);
  } else {
    const balance = localStorage.getItem('creditBalanceGuest');
    if (!balance) {
      localStorage.setItem('creditBalanceGuest', INITIAL_CREDITS_GUEST.toString());
      return INITIAL_CREDITS_GUEST;
    }
    return parseInt(balance);
  }
}

export function updateCreditBalance(newBalance, isRegistered) {
  const key = isRegistered ? 'creditBalanceRegistered' : 'creditBalanceGuest';
  const finalBalance = Math.max(0, newBalance);
  localStorage.setItem(key, finalBalance.toString());
  return finalBalance;
}

/**
 * Descuenta créditos por historia (3 sin imagen, 8 con imagen).
 * @param {{ withImage: boolean, isRegistered: boolean }} opts
 * @returns {number} nuevo saldo
 */
export function spendCredits({ withImage = false, isRegistered }) {
  const cost = withImage ? CREDITS_PER_IMAGE : CREDITS_PER_STORY;
  const current = getCreditBalance(isRegistered);
  if (current < cost) {
    throw new Error('INSUFFICIENT_CREDITS');
  }
  return updateCreditBalance(current - cost, isRegistered);
}

/**
 * Aplica código promoción de créditos (+200), solo una vez por cada código.
 * @param {string} code
 * @param {boolean} isRegistered
 * @returns {boolean} éxito
 */
export function applyCreditPromoCode(code, isRegistered) {
  const key = code.toUpperCase().trim();
  const bonus = PROMO_CREDIT_CODES[key];
  if (!bonus) return false;
  const newBalance = getCreditBalance(isRegistered) + bonus;
  updateCreditBalance(newBalance, isRegistered);
  return true;
}
