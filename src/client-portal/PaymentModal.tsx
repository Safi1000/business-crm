import { useState } from 'react';
import { CreditCard, Lock, CheckCircle2 } from 'lucide-react';
import { Modal } from '@ds/feedback';
import { Button, Input, FormField } from '@ds/primitives';
import { useFormatMoney } from '@/shared';
import type { Invoice } from '@/types';

/** Client-side payment flow (P3). Simulated gateway — no real charge. */
export function PaymentModal({ invoice, onClose }: { invoice: Invoice | null; onClose: () => void }) {
  const money = useFormatMoney();
  const [stage, setStage] = useState<'form' | 'processing' | 'done'>('form');
  if (!invoice) return null;
  const due = invoice.total - invoice.received;

  const pay = () => {
    setStage('processing');
    setTimeout(() => setStage('done'), 1400);
  };

  const close = () => { setStage('form'); onClose(); };

  return (
    <Modal open={!!invoice} onClose={close} title={stage === 'done' ? 'Payment Successful' : 'Pay Invoice'} description={stage === 'done' ? undefined : `${invoice.number} · ${money(due)} due`} size="md"
      footer={stage === 'done' ? <Button fullWidth onClick={close}>Done</Button> : stage === 'form' ? <><Button variant="outline" onClick={close}>Cancel</Button><Button icon={Lock} onClick={pay}>Pay {money(due)}</Button></> : undefined}>
      {stage === 'done' ? (
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-success-soft text-success"><CheckCircle2 size={30} /></span>
          <p className="font-semibold text-content">{money(due)} paid for {invoice.number}</p>
          <p className="text-sm text-content-muted">A receipt has been emailed to you.</p>
        </div>
      ) : stage === 'processing' ? (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <span className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
          <p className="text-sm text-content-muted">Processing your payment securely…</p>
        </div>
      ) : (
        <div className="space-y-4">
          <FormField label="Card Number"><Input icon={CreditCard} placeholder="4242 4242 4242 4242" defaultValue="4242 4242 4242 4242" /></FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Expiry"><Input placeholder="MM/YY" defaultValue="12/28" /></FormField>
            <FormField label="CVC"><Input placeholder="123" defaultValue="123" /></FormField>
          </div>
          <FormField label="Name on Card"><Input placeholder="Full name" /></FormField>
          <p className="flex items-center gap-1.5 text-2xs text-content-subtle"><Lock size={12} /> Payments are encrypted. This is a simulated gateway for the demo.</p>
        </div>
      )}
    </Modal>
  );
}
