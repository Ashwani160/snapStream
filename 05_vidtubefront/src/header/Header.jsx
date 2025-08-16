import { NavLink } from "react-router-dom";

const Header=function(){
    return(
        <nav>
            <NavLink to='/login'>
                Login
            </NavLink>
            <NavLink to='/allusers'>
                Community Directory
            </NavLink>

        </nav>
    )
}
export default Header