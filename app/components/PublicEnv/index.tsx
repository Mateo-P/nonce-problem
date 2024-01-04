import type { BrowserEnvironment } from '@/constants/env.server';
import { useNonce } from '@/hooks/use-nonce';

type PublicEnvProps = BrowserEnvironment;

const PublicEnv = (props: PublicEnvProps): React.JSX.Element => {
  const nonce = useNonce();

  const onlyPublicEnv = Object.entries(props).reduce((result, [key, value]) => {
    if (key.startsWith('PUBLIC_')) {
      result = { ...result, [key]: value };
    }

    return result;
  }, {});

  return (
    <script
      data-testid="public_env"
      nonce={nonce}
      dangerouslySetInnerHTML={{
        __html: `window.ENV = ${JSON.stringify(onlyPublicEnv)}`,
      }}
    />
  );
};

export default PublicEnv;
