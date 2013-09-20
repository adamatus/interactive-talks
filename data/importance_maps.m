cd ~/data/heri/motionWM/26/fmri

load mvpa_init

%% Mask work
% Create a mask that's composed of equal # of voxels from each area
model = get_mat(subj,'pattern','model');
model = model(:,3); % Pull out motion T-stat
subj = initset_object(subj,'pattern','sample_f',model,'masked_by','Wholebrain');
masks = {'EarlyVis','HigherVis','Parietal','Frontal'};

vxls = 500;

for m = 1:length(masks)
    thism = masks{m};
    subj = create_pattern_from_mask(subj,'sample_f',thism,[thism '_f']);
    subj = create_sorted_mask(subj,[thism '_f'],[thism '_' num2str(vxls/length(masks))],vxls/length(masks),'descending',true);
end

subj = union_masks(subj,['combined_',num2str(vxls)],['.*_' num2str(vxls/length(masks))]);


%% Setup classifier details

% Logistic regression
class_args(1).train_funct_name = 'train_logreg';
class_args(1).test_funct_name = 'test_logreg';
class_args(1).penalty = 25;
class_args(1).name = 'logreg';

% SMLR
class_args(end+1).train_funct_name = 'train_smlr';
class_args(end).test_funct_name = 'test_smlr';
class_args(end).name = 'smlr';

% Lasso
class_args(end+1).train_funct_name = 'train_enet';
class_args(end).test_funct_name = 'test_enet';
class_args(end).alpha = 1;
class_args(end).name = 'lasso';

% E-net
class_args(end+1).train_funct_name = 'train_enet';
class_args(end).test_funct_name = 'test_enet';
class_args(end).alpha = .4;
class_args(end).name = 'enet';

% Ridge regression
class_args(end+1).train_funct_name = 'train_ridge';
class_args(end).test_funct_name = 'test_ridge';
class_args(end).name = 'ridge';
class_args(end).penalty = 25;

%% Setup selector
regs = get_mat(subj,'regressors','dirs');
trial_type = get_mat(subj,'regressors','task');
sel = ones(1,size(regs,2))*3;
sel(find(sum(regs)==0)) = 0;
sel(trial_type(2,:)==1) = 0;
sel([348 709 1070 1431 1792 2153 2514]) = 0;


%% Classify
%for c = 2:length(class_args)
for c = 1
    full_w = [];
    full_perf = [];

    for tr = 0:15 
        subj = shift_regressors(subj,'dirs','runs',tr);
        subj = initset_object(subj,'selector','no_rest_sel',sel([end-tr+1:end 1:end-tr]));

        [subj results] = loo_validate_timeseries(subj,'epi_z',['dirs_sh' num2str(tr)],'no_rest_sel',['combined_',num2str(vxls)],class_args(c),'timeseries',0);

        w = extract_weights(results,class_args(c).name);

        mean_w = mean(w,1);
        subj = initset_object(subj,'pattern','weights',mean_w','masked_by',['combined_',num2str(vxls)]);
        ws = [tr];
        full_perf = [full_perf; tr results.total_perf];
        for m = 1:length(masks)
            thism = masks{m};
            subj = create_pattern_from_mask(subj,'weights',[thism '_' num2str(vxls/length(masks))],[thism '_w']);
            w = get_mat(subj,'pattern',[thism '_w']);
            ws = [ws w'];
            subj = remove_object(subj,'pattern',[thism '_w']);
        end
        full_w = [full_w; ws];
        subj = remove_object(subj,'pattern','weights');
        subj = remove_object(subj,'selector','no_rest_sel');
        subj = remove_object(subj,'regressors',['dirs_sh' num2str(tr)]);
    end

    dlmwrite(['~/Dropbox/Lab/DataVis/MotionWM - Importance Maps/data/' class_args(c).name '-weight.csv'],full_w,'delimiter',',','precision',6)
    dlmwrite(['~/Dropbox/Lab/DataVis/MotionWM - Importance Maps/data/' class_args(c).name '-accuracy.csv'],full_perf,'delimiter',',','precision',6)
end