const API_URL = 'http://localhost:8000/v1'

async function httpGetPlanets() {
  // access function on server side to get all planets
  const response = await fetch(`${API_URL}/planets`)
  return await response.json()
  
}

async function httpGetLaunches() {
  const response = await fetch(`${API_URL}/launches`)
  const fetchedLaunches = await response.json()
  return fetchedLaunches.sort((a,b) => {
    return a.flightNumber - b.flightNumber
  })
}

async function httpSubmitLaunch(launch) {
  try {
    return await fetch(`${API_URL}/launches`,{
      method:'post',//defini o metodo da url
      headers: {
        'Content-Type': 'application/json',// informar para o browser que os dados sao em json
      },
      // inserir os dados do formulario e formatar para ser utilizado em req.body
      body:JSON.stringify(launch),
    })
  } catch (err){
    console.log(err)
    return {
      ok: false,// para informar em useLaunches que a requisiçao falhou
    };
  }
  
  
  // Submit given launch data to launch system.
}

async function httpAbortLaunch(id) {
  try {
    return await fetch(`${API_URL}/launches/${id}`,{
      method: 'delete'
    })
  } catch(err){
    console.log(err)
    return {
      ok: false,
    }
  }
}

export {
  httpGetPlanets,
  httpGetLaunches,
  httpSubmitLaunch,
  httpAbortLaunch,
};