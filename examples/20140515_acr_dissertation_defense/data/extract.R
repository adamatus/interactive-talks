library(RMySQL)
#source('~/Dropbox/Lab/Manuscripts/Working - MotionWM/plotting_funcs.R')
good_subs_char <- c("01","03","26","31","32")
good_subs <- as.numeric(good_subs_char)
extract_timeseries <- function(mask) {
  d <- Sys.glob(paste('/data/heri/motionWM/??/fmri/timeseries/mean_',mask,'.Rdata',sep=''))
  all.dir_ts.means <- data.frame()
  all.dir_ts.ses <- data.frame()
  all.spd_ts.means <- data.frame()
  all.spd_ts.ses <- data.frame()
  for (i in d)
  {
    load(i)
    all.dir_ts.means <- rbind(all.dir_ts.means,dir_ts.means)
    all.dir_ts.ses <- rbind(all.dir_ts.ses,dir_ts.ses)
    all.spd_ts.means <- rbind(all.spd_ts.means,spd_ts.means)
    all.spd_ts.ses <- rbind(all.spd_ts.ses,spd_ts.ses)
  }
  all.dir_ts.ses <- colMeans(all.dir_ts.ses)
  all.dir_ts.ses <- all.dir_ts.ses/sqrt(nrow(all.dir_ts.means))
  all.dir_ts.means <- colMeans(all.dir_ts.means)
  all.spd_ts.ses <- colMeans(all.spd_ts.ses)
  all.spd_ts.ses <- all.spd_ts.ses/sqrt(nrow(all.spd_ts.means))
  all.spd_ts.means <- colMeans(all.spd_ts.means)
  list(dir.means=all.dir_ts.means,dir.ses=all.dir_ts.ses,spd.means=all.spd_ts.means,spd.ses=all.spd_ts.ses)
}
###################################################
### code chunk number 3: extract-decoding-data
###################################################
get.sql.data <- function(dim='Direction',mask='WholebrainGLM',fs_method='GLM',train_cue='Direction')
{
  con <- dbConnect(MySQL())
  rs <- dbSendQuery(con,paste("SELECT id FROM masks WHERE mask = '",mask,"'",sep=''))
  mask_id <- unlist(fetch(rs,ns=1))
  rs <- dbSendQuery(con,paste("SELECT id FROM dimensions WHERE name = '",dim,"'",sep=''))
  dim_id <- unlist(fetch(rs,ns=1))
  rs <- dbSendQuery(con,paste("SELECT id FROM feature_selection WHERE name = '",fs_method,"'",sep=''))
  fs_id <- unlist(fetch(rs,ns=1))
  rs <- dbSendQuery(con,paste("SELECT id FROM cues WHERE cue = '",train_cue,"'",sep=''))
  cue_id <- unlist(fetch(rs,ns=1))
  sql_stm <- paste('SELECT sub_id,train_tr,count(*) as iterations,test_tr,avg(wta_correct) AS correct,',
  'avg(extra_test_perf) AS
  extra_correct FROM performance JOIN
  runs ON performance.run_id = runs.id WHERE')
  sql_stm <- paste(sql_stm,paste(
  c('dim_id','feature_sel_id','mask_id','train_cue_id','permuted'),'=',
  c(dim_id,fs_id,mask_id,cue_id,0),collapse=' AND '))
  sql_stm <- paste(sql_stm,"GROUP BY sub_id,train_tr,test_tr")
  rs <- dbSendQuery(con,sql_stm)
  d <- data.frame()
  while(!dbHasCompleted(rs))
  {
  d <- rbind(d,fetch(rs,ns=-1))
  }
  fetch.result <- dbClearResult(rs)
  dbDisconnect(con)
  dw <- data.frame()
  if (nrow(d) > 0)
  {
  dw <- reshape(d,v.names=c('correct','extra_correct'),
  timevar='test_tr',idvar=c('train_tr','sub_id'),direction="wide")
  dw <- subset(dw,sub_id %in% good_subs)
  dw <- aggregate(dw,list(dw$train_tr),mean)
  }
  dw
}
pal <- rainbow(18)
for (p in 1:length(pal)) {
  pal[p] <- substr(pal[p],0,7)
}
out <- paste('var cols = [',paste("'",pal,"'",sep='',collapse=','),'];\n',sep='')
mask <- c('WholebrainGLM','FrontalDelay','ParietalDelay','HigherVisNoDel','EarlyVisNoDel')
method <- c('GLM','Delay','Delay','NoDel','NoDel')
out <- paste(out,"var mydata = {",sep='')
for (m in 1:length(mask))
{
  dw <- get.sql.data(dim='Direction',mask=mask[m],fs_method=method[m],train_cue='Direction')
  dirs <- dw[,colnames(dw)[grep('^correct',colnames(dw))]]
  spds <- dw[,colnames(dw)[grep('^extra_correct',colnames(dw))]]
  out <- paste(out,paste("'",mask[m],"':{'dir':[",sep=''))
  for (i in 1:nrow(dirs))
  {
    out <- paste(out,'[',paste(dirs[i,],collapse=','),'],',sep='')
  }
  out <- paste(out,"],\n'spd':[",sep='')
  for (i in 1:nrow(dirs))
  {
    out <- paste(out,'[',paste(spds[i,],collapse=','),'],',sep='')
  }
  out <- paste(out,"],\n'task':[",sep='')
  
  dw <- get.sql.data(dim='Task',mask=mask[m],fs_method=method[m],train_cue='Direction')
  task <- dw[,colnames(dw)[grep('^correct',colnames(dw))]]
  for (i in 1:nrow(dirs))
  {
    out <- paste(out,'[',paste(task[i,],collapse=','),'],',sep='')
  }
  out <- paste(out,']},\n',sep='')
}
out <- paste(out,'};',sep='')
cat(out,file='motionWM-decoding-data.js')