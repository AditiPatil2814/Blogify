import { AppBar, Toolbar, styled, Button } from '@mui/material'; 
import { Link, useNavigate } from 'react-router-dom';

const Component = styled(AppBar)`
    background: #FFFFFF;
    color: black;
`;

const Container = styled(Toolbar)`
    justify-content: center;
    & > a, & > button {
        padding: 20px;
        color: #000;
        text-decoration: none;
        background: none;
        border: none;
        cursor: pointer;
        font-size: 16px;
    }
`;

const Header = () => {
    const navigate = useNavigate();

    const logout = () => {
        // Optional: clear session/local storage here
        sessionStorage.clear();
        navigate('/account');
    };

    return (
        <Component>
            <Container>
                <Link to='/'>HOME</Link>
                <Link to='/about'>ABOUT</Link>
                <Link to='/contact'>CONTACT</Link>
                <Button onClick={logout}>LOGOUT</Button>
            </Container>
        </Component>
    )
}

export default Header;
