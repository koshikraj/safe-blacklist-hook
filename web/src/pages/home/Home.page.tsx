import { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import {
  Avatar,
  Badge,
  Button,
  Text,
  Group,
  Input,
  Paper,
  Select,
  useMantineColorScheme,
  Combobox,
  useCombobox,
  InputBase,
  Anchor,
  Alert,
  Container,
  Skeleton,
  Stack,
  TextInput,
  Chip,
  Box,
  Title,
} from '@mantine/core';
import classes from './Home.module.css';
import ETHIndia from '../../assets/images/ethindia.svg';
import Safe from '../../assets/images/safe.svg';

import { NetworkUtil } from '../../logic/networks';
import { useDisclosure } from '@mantine/hooks';
import {  loadBlacklistedAddresses, updateBlacklistedAddress } from '../../logic/module';
import { ZeroAddress } from 'ethers';

import Confetti from 'react-confetti';
import { IconBrandGithub, IconCheckbox, IconCoin, IconCurrency, IconMoneybag, IconPlus, IconWallet} from '@tabler/icons';


import { useNavigate } from 'react-router-dom';
import { getProvider } from '@/logic/web3';
import { badgeIcons, getIconForId, getTokenInfo, getTokenList, tokenList } from '@/logic/tokens';

import {CopyToClipboard} from 'react-copy-to-clipboard';
import { getSafeInfo } from '@/logic/safeapp';
import { getTokenBalance } from '@/logic/utils';
import { formatEther } from 'viem';
import { IconBrandTwitterFilled, IconBrandX } from '@tabler/icons-react';



function HomePage() {
  


  const { colorScheme } = useMantineColorScheme();

  const dark = colorScheme === 'dark';

  const [blacklistAddress, setBlacklistAddress ]: any = useState();
  const [blacklistedAddresses, setBlacklistedAddresses ]: any = useState([]);

  const [addedAddresses, setAddedAddresses ]: any = useState([]);
  const [removedAddresses, setRemovedAddresses ]: any = useState([]);



  const [network, setNetwork] = useState('');
  const [chainId, setChainId] = useState(5);

  const [isLoading, setIsLoading] = useState(false);
  const [isAddressLoading, setIsddressLoading] = useState(false);
  const [safeError, setSafeError] = useState(false);


  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  const [value, setValue] = useState<string>("0x0000000000000000000000000000000000000000");
  const [ balance, setBalance ] = useState<any>(0);



  const addAddress = async (address: string) => {

    if(address && !addedAddresses.includes(address) && !blacklistedAddresses.includes(address)) {
    setAddedAddresses([...addedAddresses, address])
    }
  
    if(removedAddresses.includes(address)) {
      let newSet = new Set(removedAddresses)
      newSet.delete(address)
      setRemovedAddresses(Array.from(newSet))
      }
  }
  
  const removeAddress = async (address: string) => {
  
    if(!removedAddresses.includes(address) && blacklistedAddresses.includes(address)) {
    setRemovedAddresses([...removedAddresses, address])
    }
  
    if(addedAddresses.includes(address)) {
      let newSet = new Set(addedAddresses)
      newSet.delete(address)
      setAddedAddresses(Array.from(newSet))
      }
  
  
  
  }

  const create = async () => {

    setIsLoading(true);
    

    
    try {
      const result = await updateBlacklistedAddress( addedAddresses, removedAddresses);

      setIsLoading(false);
    } catch (e) {
      setIsLoading(false);
      setSafeError(true);
    }
  };

 
  useEffect(() => {
    (async () => {
      const provider = await getProvider();

      const chainId = (await provider.getNetwork()).chainId;

      setIsddressLoading(true);
      setBlacklistedAddresses(await loadBlacklistedAddresses())
      setIsddressLoading(false);


      setChainId(Number(chainId));
      setNetwork(
        `${NetworkUtil.getNetworkById(Number(chainId))?.name}`
      );

      try {
        const safeInfo = await getSafeInfo();
        if(value == ZeroAddress) {
        setBalance(formatEther(await provider.getBalance(safeInfo?.safeAddress)))
        } else {
        setBalance(await getTokenBalance(value, safeInfo?.safeAddress, provider))
        }
        }
        catch(e)
        {
          console.log('No safe found')
        }
        
    })();
  }, [value]);

  return (
    <>
        <>
        
        <div>      
              <h1 className={classes.heading}>Blacklist addresses for your
              <div className={classes.safeContainer}>
              <img
            className={classes.safe}
            src={Safe}
            alt="avatar"
          />
          </div>
          </h1>
          </div>
        
        <div className={classes.homeContainer}>

        <Paper className={classes.formContainer} shadow="md" withBorder radius="md" p="xl" >

        { !Object.keys(tokenList).includes(chainId.toString()) && <Alert variant="light" color="yellow" radius="lg" title="Unsupported Network">
      This app supports only these networks as of now <b> : <br/> {Object.keys(tokenList).map((chainId) => `${NetworkUtil.getNetworkById(Number(chainId))?.name} ${NetworkUtil.getNetworkById(Number(chainId))?.type}, `)} </b>
    </Alert> }

    { safeError && <Alert variant="light" color="yellow" radius="lg" title="Open as Safe App">

     Try this application as a <span/>
      <Anchor href="https://app.safe.global/share/safe-app?appUrl=https://blacklist.zenguard.xyz&chain=sep">
      Safe App
        </Anchor> <span/>
        on Safe Wallet.
      
    </Alert> }
          
          
          
          {/* <div className={classes.formContainer}> */}
            
    <div className={classes.inputContainer}>
      <Title size={'md'}> Add addresses to blacklist</Title>
  

      <Group>
          
          <Container
            style={{
              display: "flex",
              flexDirection: "column",
              marginLeft: "10px",
              justifyContent: "center",
              marginBottom: "20px",
            }}
          >
          <Stack>

          <Group>

          <Input.Wrapper label={`Blacklist Address`} style={{width: "60%"}}>
            <TextInput
              size="lg"
              // value={tokenValue}
              onChange={(event) => setBlacklistAddress(event.currentTarget.value)}
              placeholder="Enter Address"
              className={classes.input}
            />
          </Input.Wrapper>

          <Button
          // className={classes.button}
          size="lg"
          variant="outline"
          color='green'
          leftSection={<IconPlus />} 
          onClick={ () => {  addAddress(blacklistAddress);}}
          style={{
          display: "flex",
          flexDirection: "column",
          width: "30%",

          // alignItems: "center",
          justifyContent: "center",
          marginTop: "30px",
          }}
          >
          Add
          </Button>
          </Group>
        </Stack>
            
            <Text mt={"lg"} > {  "blacklisted" }  Addresses 
            </Text>

         

            { isAddressLoading && <Group
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Skeleton height={30} mt={6}  radius="xl"  width="100%" />
        </Group>   
         }

             
            { 
            !isAddressLoading && blacklistedAddresses.concat(addedAddresses).map((address: string) => (<Chip 
              style={{
                // alignItems: "center",
                marginTop: "15px",
                justifyContent: "center",
              }}
              onChange={(checked: any) => { if(checked) addAddress(address); else removeAddress(address);}}
              defaultChecked color="green" variant="outline" radius="md">{address}</Chip> )) 
            
            }
            
          </Container>
        </Group>
    

            </div>
            <Button
              size="lg" radius="md" 
              fullWidth
              color="green"
              className={classes.btn}
              onClick={create}
              loaderProps={{ color: 'white', type: 'dots', size: 'md' }}
              loading={isLoading}
            >
              {isLoading ? 'Saveing ...' : 'Save Addresses'}
            </Button>

          </Paper>
          
        </div>
       
        <div className={classes.avatarContainer}>
                    <Group className={classes.mode}>
              {/* <Group className={classes.container} position="center"> */}
              <IconBrandX 
                    size={30}
                    stroke={1.5}
                    onClick={() => window.open("https://x.com/zenguardxyz")}
                    style={{ cursor: 'pointer' }}
                  />
              <IconBrandGithub
                size={30}
                stroke={1.5}
                onClick={() => window.open("https://github.com/koshikraj/safe-blacklist-hook")}
                style={{ cursor: 'pointer' }}
              />
      
              {/* </Group> */}
            {/* </Group> */}
          </Group>
          </div>
     
        </>
    </>
  );
}

export default HomePage;

// show dropdown. no model. list all token
