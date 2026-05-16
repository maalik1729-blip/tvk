import Modal from './Modal'
import Button from './Button'

/**
 * Tiny confirm dialog built on <Modal/>. Use for discard / destructive prompts.
 *
 *   <ConfirmDialog
 *     open={open}
 *     onClose={() => setOpen(false)}
 *     onConfirm={doIt}
 *     title="Discard details?"
 *     description="Switching category will clear what you've entered."
 *     confirmLabel="Discard"
 *     tone="danger"
 *   />
 */
export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'primary', // 'primary' | 'danger'
  loading = false,
}) {
  const confirmKind = tone === 'danger' ? 'danger' : 'primary'
  return (
    <Modal
      open={open}
      onClose={loading ? undefined : onClose}
      title={title}
      description={description}
      size="sm"
      closeOnBackdrop={!loading}
      hideClose={loading}
      footer={
        <>
          <Button
            kind="ghost"
            onClick={onClose}
            disabled={loading}
          >
            {cancelLabel}
          </Button>
          <Button
            kind={confirmKind}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </>
      }
    />
  )
}
