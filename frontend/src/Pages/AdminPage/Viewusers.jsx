import React, { useEffect, useState } from "react";

const ViewUsers = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/admin/users")
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="admin-users">
  <h2>Users Information</h2>
  {/* <p className="admin-subtitle">
    Below is the information of all registered users.
  </p> */}

  <table className="users-table">
    <thead>
      <tr>
        <th>ID</th>
        <th>Username</th>
        <th>Email</th>
        <th>Role</th>
      </tr>
    </thead>

    <tbody>
      {users.map((user) => (
        <tr key={user.UserId}>
          <td>{user.UserId}</td>
          <td>{user.Username}</td>
          <td>{user.Email}</td>
          <td>{user.User_Role}</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
  );
};

export default ViewUsers;
