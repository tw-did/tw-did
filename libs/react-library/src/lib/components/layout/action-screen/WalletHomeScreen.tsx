import { BackgroundContainer } from '../../common/background';
import { Container, FlexSpace } from '../../common/container';
import styles from './layout.module.scss';
import React, { useEffect } from 'react';
import { Logo } from '../../common/icons/logo';
import { GoIcon } from '../../common/icons/go';
import { ErrorIcon } from '../../common/icons/error';
import { SuccessIcon } from '../../common/icons/success';
import { Button } from '../../common/button';
import { ConnectionCardSimple } from '../ConnectionsCardSimple/ConnectionCardSimple';

export const WalletHomeScreen = ({
  user,
  mode,
  gotoRegister,
  gotoView,
  gotoSelect,
}: {
  user?: {
    hashedNationalId: string;
    walletAddr: string;
  };
  mode: 'view' | 'select';
  gotoRegister: () => void;
  gotoView: () => void;
  gotoSelect: () => void;
}) => {
  interface ScreenState {
    icon: () => React.ReactNode;
    title: string;
    instructions: string;
    button: string;
    buttonIcon: () => React.ReactNode;
    buttonAction: () => void;
  }

  const ScreenStates = {
    notBound: {
      icon: ErrorIcon,
      title: 'There are no credential in your wallet',
      instructions: 'Register in tw-did.com to get credential.',
      button: 'Register',
      buttonIcon: GoIcon,
      buttonAction: gotoRegister,
    },
    view: {
      icon: SuccessIcon,
      title: 'Your identity',
      instructions: 'View your credentials',
      button: 'View',
      buttonIcon: GoIcon,
      buttonAction: gotoView,
    },
    select: {
      icon: SuccessIcon,
      title: 'Your identity',
      instructions: 'Select your credentials',
      button: 'Select',
      buttonIcon: GoIcon,
      buttonAction: gotoSelect,
    },
  };

  const [currentState, setCurrentState] = React.useState<ScreenState>(
    ScreenStates.notBound
  );

  useEffect(() => {
    if (user) {
      setCurrentState(ScreenStates[mode]);
    }
  }, [user]);
  return (
    <BackgroundContainer>
      <Container>
        <div className={styles.ActionScreen}>
          <FlexSpace />
          <div className={styles.Center}>
            <div className={styles.fixedIcon}>{currentState.icon()}</div>
            <Logo />
          </div>

          <div>
            <h1 className={styles.textLarge}> {currentState.title} </h1>
            {user && (
              <ConnectionCardSimple
                nationID={user.hashedNationalId}
                walletAddr={user.walletAddr}
              />
            )}
            <p className={styles.Instructions}>{currentState.instructions}</p>
            <Button
              type="primary"
              text={currentState.button}
              onClick={currentState.buttonAction}
              icon={currentState.buttonIcon}
            />
          </div>
        </div>
      </Container>
    </BackgroundContainer>
  );
};
