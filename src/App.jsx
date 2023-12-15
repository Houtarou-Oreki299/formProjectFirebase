import { Routes, Route } from "react-router-dom"
import Homepage from './components/Homepage'
import CreateRec from "./components/CreateRec"
import ViewRecords from "./components/ViewRecords"
import Edit from "./components/Edit"
import './App.css'
import { Link } from "react-router-dom"

function App() {


  return (
    <>
    <nav>
      <button className="button"><Link className="linkDecoration" to='/'>Home</Link></button>
    <button className="button create"><Link className="linkDecoration" to="/CreateRecord">Create Record</Link></button>
    <button className="button view"><Link className="linkDecoration" to="/ViewRecords" >View Records</Link> </button>
    </nav>
    <Routes>
      <Route path="/" element = { <Homepage /> } />
      <Route path="/CreateRecord" element = { <CreateRec /> } />
      <Route path="/ViewRecords"  element = {<ViewRecords />} />
      <Route path="/ViewRecords/:id/Edit"   element = {<Edit />} />
    </Routes>
    </>
  )
}

export default App
