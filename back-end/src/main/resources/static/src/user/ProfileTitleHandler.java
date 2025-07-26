package src.user;

import src.database.DatabaseConnection;
import java.sql.Connection;
import java.sql.PreparedStatement;

public class ProfileTitleHandler {
    public boolean saveProfileTitle(int signupPersonId, String profileTitle) {
        try {
            Connection conn = DatabaseConnection.getConnection();
            String sql = "INSERT INTO user_profiles (signup_person_id, profile_title) VALUES (?, ?)";
            PreparedStatement stmt = conn.prepareStatement(sql);
            stmt.setInt(1, signupPersonId); // Foreign key (User id)
            stmt.setString(2, profileTitle);

            int rows = stmt.executeUpdate();
            conn.close();
            return rows > 0;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
}
