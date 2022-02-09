import * as React from 'react'
import {Client as Styletron} from 'styletron-engine-atomic';
import {Provider as StyletronProvider} from 'styletron-react';
import {LightTheme, BaseProvider, styled} from 'baseui';
import { Heading, HeadingLevel } from 'baseui/heading'
import { Button } from "baseui/button";
import { Block } from 'baseui/block'
import logo from './logo.svg';
import './App.css';
import * as nearAPI from "near-api-js";
import { Input } from "baseui/input"
import { Card, StyledBody, StyledAction } from 'baseui/card';

const engine = new Styletron();
const { providers } = nearAPI;
const provider = new providers.JsonRpcProvider("https://rpc.testnet.near.org");

global.Buffer = global.Buffer || require('buffer').Buffer;

const Centered = styled('div', {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100%',
});

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      contract_id: "",
      account_id: "",
      metadatas: null,
    };

    this.showNFT = this.showNFT.bind(this);
    this.NFTViewer = this.NFTViewer.bind(this);
  }

  async showNFT(contract_id, account_id) {
    let rawResult = await provider.query({
      request_type: "call_function",
      account_id: contract_id,
      method_name: "nft_tokens_for_owner",
      args_base64: Buffer.from(`{"account_id": "${account_id}"}`).toString('base64'),
      finality: "optimistic",
    })

    this.setState({metadatas: JSON.parse(Buffer.from(rawResult.result).toString())});
  }

  NFTViewer() {
    if (!this.state.metadatas) {
      return <></>;
    }

    return (
        <>
          {this.state.metadatas.map(metadata => {
            return (
                <Card
                    overrides={{Root: {style: {width: '328px'}}}}
                    headerImage={metadata.metadata.media}
                    title={metadata.metadata.title}
                >
                  <StyledBody>
                    {metadata.metadata.description}
                  </StyledBody>
                </Card>
            )
          })}
        </>
    )
  }

  render() {
    return (
        <StyletronProvider value={engine}>
          <BaseProvider theme={LightTheme}>
            <Centered>
              <Block width="500px">
                <HeadingLevel>
                  <Heading>Welcome to NEAR NFT Viewer</Heading>
                  <HeadingLevel>
                    <Heading>Input</Heading>
                  </HeadingLevel>
                  <Block marginBottom="10px">
                    <Input
                        value={this.state.contract_id}
                        onChange={e => {
                          this.setState({contract_id: e.target.value})
                        }}
                        placeholder="Contract ID"
                        type="text"
                        clearOnEscape
                    />
                  </Block>
                  <Block marginBottom="10px">
                    <Input
                        value={this.state.account_id}
                        onChange={e => {
                          this.setState({account_id: e.target.value})
                        }}
                        placeholder="Account ID"
                        type="text"
                        clearOnEscape
                    />
                  </Block>
                  <Block marginBottom="10px">
                    <Button
                        size="compact"
                        onClick={() => this.showNFT(this.state.contract_id, this.state.account_id)}
                    >Show NFT</Button>
                  </Block>
                  <Block marginBottom="50px">
                    {this.NFTViewer()}
                  </Block>
                </HeadingLevel>
              </Block>
            </Centered>
          </BaseProvider>
        </StyletronProvider>
    );
  }
}

export default App;
