import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Register = ({ onRegisterSuccess }) => {
    const [formData, setFormData] = useState({
      username: '',
      password: '',
      password2: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
  
    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData(prevState => ({
        ...prevState,
        [name]: value
      }));
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      setError('');
      setIsLoading(true);
  
      try {
        const response = await fetch('http://localhost:8000/auth/register/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData)
        });
  
        const data = await response.json();
  
        if (!response.ok) {
          throw new Error(data.error || 'Registration failed');
        }
  
        // After successful registration, get JWT token
        const tokenResponse = await fetch('http://localhost:8000/auth/token-login/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: formData.username,
            password: formData.password
          })
        });
  
        const tokenData = await tokenResponse.json();
  
        if (!tokenResponse.ok) {
          throw new Error('Token was not retireved');
        }
  
        // Store tokens in localStorage
        localStorage.setItem('accessToken', tokenData.access);
        localStorage.setItem('refreshToken', tokenData.refresh);
        navigate('/login');


      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };


  

return (
<form onSubmit={handleSubmit}>
    <div>
        <label>Username:</label>
        <input 
            type="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
        />
    </div>
    <div>
        <label>Password:</label>
        <input 
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
        />
    </div>

    <div>
        <label>Password2:</label>
        <input 
            type="password"
            name="password2"
            value={formData.password2}
            onChange={handleChange}
        />
    </div>

    <button type="submit">Register</button>
</form>
);

};


export default Register;
