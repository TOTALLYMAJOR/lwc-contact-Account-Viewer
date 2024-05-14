import { LightningElement, api, wire, track } from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import { NavigationMixin } from 'lightning/navigation';
import getUserInfo from '@salesforce/apex/UserInfoProvider.getUserInfo';
import NAME_FIELD from '@salesforce/schema/Contact.Name';
import EMAIL_FIELD from '@salesforce/schema/Contact.Email';
import PHONE_FIELD from '@salesforce/schema/Contact.Phone';
import ACCOUNT_NAME_FIELD from '@salesforce/schema/Contact.Account.Name';
import ACCOUNT_INDUSTRY_FIELD from '@salesforce/schema/Contact.Account.Industry';

// Simulating a simple cache mechanism
const recordCache = new Map();

export default class ContactAccountViewer extends NavigationMixin(LightningElement) {
    @api recordId;
    @track contactData;
    @track error;
    hasViewPermission = false;

    connectedCallback() {
        this.checkPermissions();
        this.fetchData();
    }

    checkPermissions() {
        getUserInfo().then(userInfo => {
            // Assuming 'Can_View_Contact_Details' is a custom permission set in Salesforce
            this.hasViewPermission = userInfo.permissions.includes('Can_View_Contact_Details');
        }).catch(error => {
            console.error('Error fetching user info:', error);
            this.error = 'Error checking permissions.';
        });
    }

    fetchData() {
        if (!this.hasViewPermission) {
            this.error = 'You do not have permission to view contact details.';
            return;
        }

        const cacheKey = `${this.recordId}-contact`;
        const cachedData = recordCache.get(cacheKey);
        if (cachedData) {
            this.contactData = cachedData;
            this.error = undefined;
        } else {
            this.loadContactData();
        }
    }

    @wire(getRecord, { recordId: '$recordId', fields: [NAME_FIELD, EMAIL_FIELD, PHONE_FIELD, ACCOUNT_NAME_FIELD, ACCOUNT_INDUSTRY_FIELD] })
    wiredContact({ error, data }) {
        if (data) {
            const contactDetails = {
                Name: getFieldValue(data, NAME_FIELD),
                Email: getFieldValue(data, EMAIL_FIELD),
                Phone: getFieldValue(data, PHONE_FIELD),
                Account: {
                    Name: getFieldValue(data, ACCOUNT_NAME_FIELD),
                    Industry: getFieldValue(data, ACCOUNT_INDUSTRY_FIELD)
                }
            };
            this.contactData = contactDetails;
            this.error = undefined;
            const cacheKey = `${this.recordId}-contact`;
            recordCache.set(cacheKey, contactDetails); // Cache the fetched data
        } else if (error) {
            this.error = error;
            this.contactData = undefined;
        }
    }

    navigateToAccount() {
        if (!this.hasViewPermission) {
            this.error = 'You do not have permission to access this account.';
            return;
        }

        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: this.contactData.AccountId,
                objectApiName: 'Account',
                actionName: 'view'
            }
        });
    }
}
