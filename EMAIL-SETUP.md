# Earthquarter Email Setup

The join form now uses both delivery paths:

- EmailJS sends the welcome email to the participant.
- FormSubmit sends the submitted details to `earthquarter24@gmail.com`.
- EmailJS sends evidence to `earthquarter24@gmail.com` and, when available, a copy to the participant.

## EmailJS welcome template

The EmailJS join template must use the recipient field `{{to_email}}`. These variables are available:

`{{name}}`, `{{email}}`, `{{phone}}`, `{{address}}`, `{{bill_currency}}`, `{{electricity_bill}}`, `{{electricity_bill_display}}`, `{{day}}`, `{{frequency}}`, `{{display_time}}`, `{{message}}`, and `{{reply_to}}`.

The welcome template should send to `{{to_email}}` and include the participant's selected day and time using `{{frequency}}` or `{{day}}` plus `{{display_time}}`.

## EmailJS evidence template

The evidence template must contain a **File Attachment** whose source is **Form**, with parameter name `image`. The page compresses the selected image before sending because EmailJS has a small file-variable limit. The template can also use `{{image_original_name}}`, `{{image_email_size_kb}}`, `{{week_label}}`, `{{name}}`, `{{email}}`, `{{message}}`, and `{{to_email}}`.

If the template is not configured with that attachment, the email will contain the evidence details but no visible photo. This cannot be fixed from browser JavaScript alone; the EmailJS template setting is required.

## FormSubmit activation

FormSubmit may require a one-time confirmation for a new destination address. That is controlled by FormSubmit, not by this website, and cannot be disabled in front-end code. After the destination is confirmed, later submissions do not normally require repeating that setup. If you need delivery without FormSubmit confirmation, use EmailJS or a server-side mail provider for the admin notification instead.
