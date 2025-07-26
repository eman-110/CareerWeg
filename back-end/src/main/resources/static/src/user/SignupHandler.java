package src.user;

import src.database.DatabaseConnection;
import java.sql.Connection;
import java.sql.PreparedStatement;

public class SignupHandler {
    public boolean registerUser(String username, String email, String phoneNo, String password) {
        try {
            Connection conn = DatabaseConnection.getConnection();
            String sql = "INSERT INTO Users (username, email, phone_no, password_hash) VALUES (?, ?, ?, ?)";
            PreparedStatement stmt = conn.prepareStatement(sql);
            stmt.setString(1, username);
            stmt.setString(2, email);
            stmt.setString(3, phoneNo);
            stmt.setString(4, password); // Ideally hash it

            int rows = stmt.executeUpdate();
            conn.close();
            return rows > 0;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
}
