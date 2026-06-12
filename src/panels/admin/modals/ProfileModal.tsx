import { useEffect, useRef, useState } from 'react';
import { Modal, toast } from '@ds/feedback';
import { Button, Input, FormField } from '@ds/primitives';
import { Avatar } from '@ds/data-display';
import { useAuthStore } from '@/app/stores/auth';

/**
 * Lets the signed-in user edit their OWN display name, email and avatar — their
 * identity in the app shell, distinct from the company profile. Writes go to the
 * caller's own profiles row (allowed by the profiles_update_self RLS policy).
 */
export function ProfileModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const user = useAuthStore((s) => s.user);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open || !user) return;
    setName(user.name ?? '');
    setEmail(user.email ?? '');
    setAvatarUrl(user.avatarUrl ?? null);
  }, [open, user]);

  const onPickFile = (file: File) => {
    if (file.size > 512 * 1024) {
      toast.error('Please choose an image under 512 KB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setAvatarUrl(typeof reader.result === 'string' ? reader.result : null);
    reader.readAsDataURL(file);
  };

  const save = async () => {
    setSaving(true);
    try {
      await updateProfile({ name, email, avatarUrl });
      toast.success('Profile updated');
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="My Profile"
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={save} loading={saving}>
            Save Profile
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Avatar name={name || email || 'User'} src={avatarUrl ?? undefined} size="lg" />
          <div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onPickFile(f);
                e.target.value = '';
              }}
            />
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                Upload photo
              </Button>
              {avatarUrl && (
                <button
                  type="button"
                  onClick={() => setAvatarUrl(null)}
                  className="text-xs text-danger hover:underline"
                >
                  Remove
                </button>
              )}
            </div>
            <p className="mt-1 text-2xs text-content-subtle">PNG/JPG up to 512 KB.</p>
          </div>
        </div>

        <FormField label="Display Name">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
        </FormField>
        <FormField label="Display Email">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </FormField>
        <p className="text-2xs text-content-subtle">
          Shown in the app. This does not change your sign-in email.
        </p>
      </div>
    </Modal>
  );
}
