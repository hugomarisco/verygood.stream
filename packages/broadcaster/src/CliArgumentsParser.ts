import {
  ContentIntegrityProtectionMethod,
  LiveSignatureAlgorithm
} from "@bitstreamy/commons";
import Commander from "commander";
import { readFileSync } from "fs";
import { md, pki, util as forgeUtil } from "node-forge";

export class CliArgumentsParser {
  public static parse() {
    const cli = new Commander.Command()
      .option("-P|--port <port>", "Port to bind the media listener", "2003")
      .option(
        "-K|--private-key <file>",
        "RSA private key to sign data messages"
      )
      .option(
        "-I|--integrity-protection-method <NONE|SIGN-ALL>",
        "Algorithm to sign data messages",
        /^(NONE|SIGN-ALL)$/i,
        "SIGN-ALL"
      )
      .option(
        "-S|--live-signature-algorithm <RSASHA1|RSASHA256>",
        "Algorithm to sign data messages",
        /^(RSASHA1|RSASHA256)$/i,
        "RSASHA256"
      )
      .option(
        "-D|--live-discard-window <integer>",
        "Live discard window",
        "100"
      )
      .option(
        "-T|--tracker <trackerUrl>",
        "Tracker to find peers",
        "wss://tracker.bitstreamy.com:8080"
      )
      .parse(process.argv);

    const tcpServerPort = parseInt(cli.port, 10);
    const liveDiscardWindow = parseInt(cli.liveDiscardWindow, 10);

    const { tracker: trackerUrl } = cli;

    const privateKey = cli.privateKey
      ? pki.privateKeyFromPem(readFileSync(cli.privateKey))
      : pki.rsa.generateKeyPair({
          bits: 1024,
          e: 65537
        }).privateKey;

    // const publicKey = pki.rsa.setPublicKey(privateKey.n, privateKey.e);

    let swarmId: Buffer;
    let liveSignatureAlgorithm: number | undefined;
    let contentIntegrityProtectionMethod: number;

    switch (cli.integrityProtectionMethod) {
      case "SIGN-ALL":
        contentIntegrityProtectionMethod =
          ContentIntegrityProtectionMethod.SIGN_ALL;

        switch (cli.liveSignatureAlgorithm) {
          case "RSASHA1":
            liveSignatureAlgorithm = LiveSignatureAlgorithm.RSASHA1;
            break;
          case "RSASHA256":
            liveSignatureAlgorithm = LiveSignatureAlgorithm.RSASHA256;
            break;
          default:
            throw new Error("Invalid live signature algorithm");
        }

        const n = Buffer.from(
          forgeUtil.binary.hex.decode(privateKey.n.toString(16))
        );

        const e = Buffer.from(
          forgeUtil.binary.hex.decode(privateKey.e.toString(16))
        );

        let eLength: Buffer;

        if (e.length <= 255) {
          eLength = Buffer.alloc(1);
          eLength.writeUInt8(e.length, 0);
        } else {
          eLength = Buffer.alloc(3);
          eLength.writeInt8(0, 0);
          eLength.writeUInt16BE(e.length, 1);
        }

        swarmId = Buffer.concat([
          Buffer.from([liveSignatureAlgorithm]),
          eLength,
          e,
          n
        ]);

        break;
      case "NONE":
      default:
        contentIntegrityProtectionMethod =
          ContentIntegrityProtectionMethod.NONE;

        swarmId = Buffer.from("abc", "utf-8");
    }

    const ownershipSignature = Buffer.from(
      forgeUtil.binary.raw.decode(
        privateKey.sign(
          md.sha1.create().update(forgeUtil.binary.raw.encode(swarmId))
        )
      )
    );

    return {
      contentIntegrityProtectionMethod,
      liveDiscardWindow,
      liveSignatureAlgorithm,
      ownershipSignature,
      privateKey,
      swarmId,
      tcpServerPort,
      trackerUrl
    };
  }
}
