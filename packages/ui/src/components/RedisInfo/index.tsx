import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import Button from '@material-ui/core/Button';
import shallow from 'zustand/shallow';
import { useRedisInfoModalStore } from '@/stores/redis-info-modal';
import List from '@material-ui/core/List';
import ListItem, { ListItemProps } from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import { useQuery } from 'react-query';
import { useNetwork } from '@/hooks/use-network';
import NetworkRequest from '../NetworkRequest';
import { QueryKeysConfig } from '@/config/query-keys';
import ms from 'ms';
import { getPollingInterval } from '@/stores/network-settings';

const useStyles = makeStyles({
  keyValueRoot: {
    display: 'flex',
    justifyContent: 'space-between',
  },
});
type TKVProps = {
  k: string;
  v?: string;
};
const KV = ({ k, v }: TKVProps) => {
  const cls = useStyles();
  return (
    <ListItem divider>
      <ListItemText>
        <Box className={cls.keyValueRoot}>
          <span>{k}</span>
          <span>{v}</span>
        </Box>
      </ListItemText>
    </ListItem>
  );
};
const RedisInfo = () => {
  const {
    queries: { getRedisInfo },
  } = useNetwork();
  const onClose = useRedisInfoModalStore((state) => state.close);
  const refetchInterval = getPollingInterval();
  const { data, status, refetch } = useQuery(
    QueryKeysConfig.redisInfo,
    getRedisInfo,
    {
      refetchInterval,
      select: (data) => data?.redisInfo,
    },
  );
  return (
    <>
      <DialogContent>
        <NetworkRequest status={status} refetch={refetch}>
          {data && (
            <List dense>
              <KV k="Used memory" v={data.used_memory_human} />
              <KV k="Peak Used memory" v={data.used_memory_peak_human} />
              <KV k="Total memory" v={data.total_system_memory_human} />
              <KV k="Connected clients" v={data.connected_clients} />
              <KV k="Blocked clients" v={data.blocked_clients} />
              <KV
                k="Uptime"
                v={ms(Number(data.uptime_in_seconds) * 1000, { long: true })}
              />
              <KV k="CPU time (minutes)" v={data.used_cpu_sys} />
              <KV k="Fragmentation ratio" v={data.mem_fragmentation_ratio} />
              <KV k="Version" v={data.redis_version} />
              <KV k="Mode" v={data.redis_mode} />
              <KV k="OS" v={data.os} />
              <KV k="Port" v={data.tcp_port} />
            </List>
          )}
        </NetworkRequest>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </>
  );
};
export default function RedisInfoModal() {
  const [isOpen, onClose] = useRedisInfoModalStore(
    (state) => [state.isOpen, state.close],
    shallow,
  );
  return (
    <Dialog open={isOpen} onClose={onClose}>
      <RedisInfo />
    </Dialog>
  );
}
