import './scss/styles.scss';

events.on( /^contacts\..*:change/,
 (data: { field: keyof IContactForm; value: string }) => {  appData.setContactsField(data.field, data.value);
 });

 events.on('order.address:change', (data: { value: string }) => { appData.setAddress(data.value);
 });

 