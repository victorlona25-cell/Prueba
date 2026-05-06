export const ADMIN_USER = 'admin';
export const ADMIN_PASS = '123456';

export function now() {
  return new Date().toLocaleString();
}

export function money(value) {
  return Number(value || 0).toFixed(2);
}

export function createAccount() {
  return {
    balance: 1250,
    credit: 0,
    positions: [],
    closed: [],
    movements: [],
    audit: []
  };
}
