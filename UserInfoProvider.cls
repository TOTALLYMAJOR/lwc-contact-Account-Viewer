
// Apex class to get user details and permissions
public with sharing class UserInfoProvider {
    @AuraEnabled(cacheable=true)
    public static UserInfoModel getUserInfo() {
        User currentUser = [SELECT Id, Name, Email, Phone FROM User WHERE Id = :UserInfo.getUserId()];
        // Assuming a custom setting or custom metadata to hold permissions
        Boolean hasViewPermission = checkUserPermission(currentUser.Id);
        return new UserInfoModel(currentUser, hasViewPermission);
    }

    private static Boolean checkUserPermission(Id userId) {
        // Implement your permission checking logic here
        return true; // Placeholder
    }

    public class UserInfoModel {
        @AuraEnabled public User user { get; set; }
        @AuraEnabled public Boolean hasViewPermission { get; set; }

        public UserInfoModel(User user, Boolean hasViewPermission) {
            this.user = user;
            this.hasViewPermission = hasViewPermission;
        }
    }
}
