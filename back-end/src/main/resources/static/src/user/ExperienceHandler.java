package src.user;

import src.database.DatabaseConnection;
import java.sql.Connection;
import java.sql.PreparedStatement;

public class ExperienceHandler {
    public boolean addExperience(int userId, String jobTitle, String companyName, String startDate, String endDate) {
        try {
            Connection conn = DatabaseConnection.getConnection();
            String sql = "INSERT INTO Experiences (user_id, job_title, company_name, start_date, end_date) VALUES (?, ?, ?, ?, ?)";
            PreparedStatement stmt = conn.prepareStatement(sql);
            stmt.setInt(1, userId);
            stmt.setString(2, jobTitle);
            stmt.setString(3, companyName);
            stmt.setString(4, startDate);
            stmt.setString(5, endDate);

            int rows = stmt.executeUpdate();
            conn.close();
            return rows > 0;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
}
