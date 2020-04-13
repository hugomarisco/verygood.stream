import {
  ContentIntegrityProtectionMethod,
  LiveSignatureAlgorithm
} from "@bitstreamy/commons";
import Commander from "commander";
import fs from "fs";
import NodeRSA from "node-rsa";
import { promisify } from "util";

const readFile = promisify(fs.readFile);

export class CliArgumentsParser {
  public static async parse() {
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
        "-T|--tracker <trackerUrl>",
        "Tracker to find peers",
        "wss://tracker.bitstreamy.com:8080"
      )
      .parse(process.argv);

    const tcpServerPort = parseInt(cli.port, 10);

    const { tracker: trackerUrl } = cli;

    const privateKey = new NodeRSA({ b: 2048 });

    cli.privateKey
      ? privateKey.importKey(
          await readFile(cli.privateKey),
          "pkcs1-private-pem"
        )
      : privateKey.generateKeyPair();

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

            privateKey.setOptions({ signingScheme: "pkcs1-sha1" });
            break;
          case "RSASHA256":
            liveSignatureAlgorithm = LiveSignatureAlgorithm.RSASHA256;

            privateKey.setOptions({ signingScheme: "pkcs1-sha256" });
            break;
          default:
            throw new Error("Invalid live signature algorithm");
        }

        const { n, ...keyComponents } = privateKey.exportKey(
          "components-public"
        );

        let e: Buffer;

        if (keyComponents.e instanceof Buffer) {
          e = keyComponents.e;
        } else {
          if (keyComponents.e > Math.pow(2, 4 * 8)) {
            throw new Error("Invalid key exponent (too big)");
          }

          e = Buffer.alloc(4);
          e.writeUInt32BE(keyComponents.e, 0);
        }

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
          n.slice(1)
        ]);

        break;
      case "NONE":
      default:
        contentIntegrityProtectionMethod =
          ContentIntegrityProtectionMethod.NONE;

        swarmId = Buffer.from("abc", "utf-8");
    }

    const ownershipSignature = privateKey.sign(swarmId);

    return {
      contentIntegrityProtectionMethod,
      liveSignatureAlgorithm,
      ownershipSignature,
      privateKey,
      swarmId,
      tcpServerPort,
      trackerUrl
    };
  }
}
