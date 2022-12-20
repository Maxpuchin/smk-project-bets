import logo from './logo.svg';
import './App.css';
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { Box, Card, CardContent, Container, FormControl, Select, TextField, Typography, InputLabel, NativeSelect, MenuItem, Button, Stack, Grid   } from '@mui/material';
import Web3 from 'web3';

const CONTRACT_ABI = [
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "gameContractAddress",
				"type": "address"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "_from",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "_value",
				"type": "uint256"
			}
		],
		"name": "moneyGot",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "payToLuckyOnes",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "playerNumber",
				"type": "uint256"
			}
		],
		"name": "placeBet",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "bidder2bet",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "bidders",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "player2sum",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]

function App() {
  if(window.ethereum){
    console.log("Connected");
  }else{
    alert("install metamask extension!!")
  }

  const [walletAddress, setWalletAddress] = useState("");
  const [walletBalance, setWalletBalance] = useState(0);
  const [betContractAddress, setBetContractAddress] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState(0);
  const [betSum, setBetSum] = useState(0);
  const [prize, setPrize] = useState(null);
  const web3 = new Web3(Web3.givenProvider)

  const onSubmit = () => {
    const myContract = new web3.eth.Contract(CONTRACT_ABI, betContractAddress);
    var weiValue = web3.utils.toWei(betSum.toString(),'ether');
    myContract.methods.placeBet(selectedPlayer).send({from: walletAddress, gas: 380000, value: weiValue}, function(err, res){ console.log(err, res) })
  }

  useEffect(() => {
    window.ethereum.request({method:'eth_requestAccounts'})
    .then((res) => {
      console.log(res)
      setWalletAddress(res[0]);
      return res[0];
    }).then((address) => {
      console.log(address)
      window.ethereum.request({
        method:'eth_getBalance', 
        params: [address, 'latest']
      }).then(balance => {
          setWalletBalance(ethers.utils.formatEther(balance)) 
      })      
    })
  }, [])

  return (
    <div>
      <Container maxWidth="md">
        <Typography variant='h4' textAlign="center" marginY={2}>
          Поставить ставку на игру в камень-ножницы-бумага
        </Typography>
        <Card variant="outlined">
          <CardContent>
            <Typography variant='h5' marginY={1}>
              Правила игры:
            </Typography>
            <Typography variant='body' marginY={1}>
              Игроки считают вместе вслух «Камень… Ножницы… Бумага…», 
              одновременно качая кулаками. Затем каждый из двух игроков 
              выбирает один из этих предметов. Важно, чтобы это было сделано одновременно. <br/>          
              Победитель определяется по следующим правилам: <br/>
              1. Бумага побеждает камень («бумага обёртывает камень»). <br/>
              2. Камень побеждает ножницы («камень затупляет или ломает ножницы»). <br/>
              3. Ножницы побеждают бумагу («ножницы разрезают бумагу»). <br/>
              Если игроки показали одинаковый знак, то засчитывается ничья и игра переигрывается. <br/> <br/>
            </Typography>
            <Typography variant="button">
              <b>
              Вы можете поставить на первого или второго, выигрыш всех участников будет распределен пропорционально внесенным средствам.
              </b>  
            </Typography>
            <Typography variant='h6' marginY={1}>
              <b>Ваш кошелек:</b> {walletAddress}
            </Typography>
            <Typography variant='h6' marginY={1}>
              <b>Баланс:</b> {walletBalance} ETH
            </Typography>
            <TextField
              fullWidth 
              onChange={(e) => setBetContractAddress(e.target.value)} 
              value={betContractAddress} 
              label="Адрес СмК"
            />
            <TextField
              id="select"
              select
              value={selectedPlayer}
              onChange={(e) => setSelectedPlayer(e.target.value)}
              label="На кого ставить"
              defaultValue={0}
              fullWidth
              sx={{mt: 2}}
            >
                <MenuItem key={0} value={0}>
                  Первый
                </MenuItem>
                <MenuItem key={1} value={1}>
                  Второй
                </MenuItem>
            </TextField>
            <TextField
              fullWidth 
              type="number"
              onChange={(e) => setBetSum(e.target.value)}
              value={betSum} 
              label="Сумма"
              sx={{my : 2}}

            />
            <Button variant="contained" color="success" fullWidth onClick={onSubmit}>Сделать ставку</Button>
            <Grid container sx={{my: 4, width: "100%"}}>
              <Grid item xs={5}>
                <Button variant="outlined" color="error" fullWidth >Проверить результаты</Button>
              </Grid>
              <Grid item xs={1}>
              </Grid>
              <Grid item xs={6}>
                <Typography fullWidth><b>Ваш выигрыш составил: </b>{prize ? prize : "Пока нет результатов"}</Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card> 
      </Container>
    </div>
  );
}

export default App;
