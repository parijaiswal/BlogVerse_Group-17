import React from 'react'
import { useEffect, useState } from 'react'

const ViewSub = ({ onEdit }) => {
 const [subs, setSubs] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/admin/subscriptions")
      .then(res => res.json())
      .then(data => setSubs(data));
  }, []);

  return (
    <div className="admin-users">
      <h2>All Subscriptions</h2>

      <table className="users-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Duration (months)</th>
            <th>Price</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {subs.map(sub => (
            <tr key={sub.SubId}>
              <td>{sub.SubId}</td>
              <td>{sub.SubName}</td>
              <td>{sub.SubDuration}</td>
              <td>{sub.SubPrice}</td>
              <td>{sub.Visibility}</td>
              <td>
                <button onClick={() => onEdit(sub)} className="logout-btn">Edit</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ViewSub