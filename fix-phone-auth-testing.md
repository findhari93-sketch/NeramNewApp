# Fix Firebase Phone Auth Testing

## For Development (Test Numbers):

1. Go to Firebase Console:
   https://console.firebase.google.com/project/neramtypeco/authentication/providers

2. Click "Phone" provider

3. Scroll to "Phone numbers for testing"

4. Add your test number: +916380194614
   Set a test code: 123456

5. Save

Now you can use +916380194614 with code 123456 without sending real SMS

## For Production (Real SMS):

1. Upgrade to Blaze plan (pay-as-you-go)
2. Enable billing in Firebase Console
3. Check SMS quota limits

## Check Current Quota:
https://console.firebase.google.com/project/neramtypeco/usage

