import { Injectable, OnModuleInit } from '@nestjs/common';
import { DIDManager, MemoryDIDStore } from '@veramo/did-manager';
import {
  createAgent,
  IDIDManager,
  IResolver,
  IDataStore,
  IKeyManager,
  ICredentialPlugin,
  MinimalImportableIdentifier,
  IIdentifier,
  VerifiableCredential,
  CredentialPayload,
  ICredentialStatusVerifier,
} from '@veramo/core';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { IDataStoreORM } from '@veramo/data-store';
import { KeyStoreJson } from '@veramo/data-store-json';
import { KeyManagementSystem } from '@veramo/kms-local';
import { KeyManager, MemoryPrivateKeyStore } from '@veramo/key-manager';
import { EthrDIDProvider } from '@veramo/did-provider-ethr';
import { CredentialPlugin } from '@veramo/credential-w3c';
import { DIDResolverPlugin } from '@veramo/did-resolver';
import { Resolver } from 'did-resolver';
import { getResolver as ethrDidResolver } from 'ethr-did-resolver';
import { getResolver as webDidResolver } from 'web-did-resolver';
import { ConfigService } from '@nestjs/config';
import { VeramoConfig } from '../config/configuration';
import { CREDENTIAL_STATUS_METHOD } from '@tw-did/core';

export const KMS_NAME = 'local';

type AgentType = IDIDManager &
  IKeyManager &
  IDataStore &
  IDataStoreORM &
  IResolver &
  ICredentialStatusVerifier &
  ICredentialPlugin;

interface IssuerInfo {
  did: string;
}

@Injectable()
export class IssuanceService implements OnModuleInit {
  private agent: AgentType;
  private ethrProvider: string;
  private issuer: IIdentifier;
  private apiPrefix: string;

  constructor(configService: ConfigService) {
    const { infuraProjectId, ethrNetwork } =
      configService.get<VeramoConfig>('veramo');
    const ethrProvider =
      ethrNetwork === 'mainnet' ? 'did:ethr' : `did:ethr:${ethrNetwork}`;
    const memoryJsonStore = {
      notifyUpdate: () => Promise.resolve(),
    };

    this.apiPrefix = configService.get('server.apiPrefix');

    this.agent = createAgent<AgentType>({
      plugins: [
        new KeyManager({
          store: new KeyStoreJson(memoryJsonStore),
          kms: {
            [KMS_NAME]: new KeyManagementSystem(new MemoryPrivateKeyStore()),
          },
        }),
        new DIDManager({
          store: new MemoryDIDStore(),
          defaultProvider: ethrProvider,
          providers: {
            [ethrProvider]: new EthrDIDProvider({
              defaultKms: KMS_NAME,
              network: ethrNetwork,
              rpcUrl: 'https://goerli.infura.io/v3/' + infuraProjectId,
            }),
          },
        }),
        new DIDResolverPlugin({
          resolver: new Resolver({
            ...ethrDidResolver({ infuraProjectId }),
            ...webDidResolver(),
          }),
        }),
        new CredentialPlugin(),
      ],
    });

    this.ethrProvider = ethrProvider;
  }

  async onModuleInit() {
    const privateKey = generatePrivateKey();
    const account = privateKeyToAccount(privateKey);
    const controllerKeyId = account.publicKey.substring(2);
    const issuer: MinimalImportableIdentifier = {
      did: `${this.ethrProvider}:${account.address}`,
      provider: this.ethrProvider,
      controllerKeyId,
      keys: [
        {
          kid: controllerKeyId,
          type: 'Secp256k1',
          kms: KMS_NAME,
          privateKeyHex: privateKey,
          publicKeyHex: controllerKeyId,
        },
      ],
    };

    this.issuer = await this.agent.didManagerImport(issuer, null);
  }

  getIssuerInfo(): IssuerInfo {
    return { did: this.issuer.did };
  }

  async signEthereumVerifiableCredential(
    id: string,
    identityId: string,
    account: string
  ): Promise<VerifiableCredential> {
    const credential: CredentialPayload = {
      issuer: { id: this.issuer.did },
      credentialSubject: {
        id: `${this.ethrProvider}:${account}`,
        value: id,
      },
      credentialStatus: {
        id: `${this.apiPrefix}/users/revocation`,
        type: CREDENTIAL_STATUS_METHOD,
        value: identityId,
      },
    };
    const vc = await this.agent.createVerifiableCredential(
      {
        credential,
        proofFormat: 'jwt',
      },
      null
    );

    return vc;
  }
}
