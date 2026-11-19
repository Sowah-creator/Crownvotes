/**
 * Split a successful vote payment into CrownVotes commission and organiser share.
 * Amounts are integer pesewas; basis points use 100 = 1%.
 */
export function calculateSplit(grossPesewas, commissionBps) {
  if (!Number.isSafeInteger(grossPesewas) || grossPesewas < 0) {
    throw new TypeError('Gross amount must be a non-negative safe integer in pesewas.');
  }
  if (!Number.isInteger(commissionBps) || commissionBps < 0 || commissionBps > 3000) {
    throw new RangeError('Commission must be between 0 and 3000 basis points.');
  }
  const platformFee = Math.floor(grossPesewas * commissionBps / 10000);
  return {
    gross: grossPesewas,
    platformFee,
    organiserNet: grossPesewas - platformFee,
  };
}
