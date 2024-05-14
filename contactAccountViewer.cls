public with sharing class ContactAccountController {
    @AuraEnabled(cacheable=true)
    public static Contact getContactWithAccount(Id contactId) {
        try {
            // Ensures that only the fields needed by the LWC are queried
            Contact result = [
                SELECT Name, Email, Phone, Account.Name, Account.Industry 
                FROM Contact 
                WHERE Id = :contactId
                LIMIT 1
            ];
            return result;
        } catch (Exception e) {
            // Proper error handling
            throw new AuraHandledException('Unable to fetch contact: ' + e.getMessage());
        }
    }
}
